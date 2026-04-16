/**
 * Game Server 모니터링 서비스 레이어
 * game-server/ 모듈 기반 실 구현
 */

import { queryWithDedup } from "../../game-server/dedup.js";
import { getQueryableServers } from "../../config/servers.js";
import { getTrendHistory } from "../../game-server/trend.js";
import { getLatencyCategory } from "../../game-server/normalize.js";
import type { HealthStatus } from "../../contracts/monitoring.types.js";
import type {
  ServerQueryResponse,
  ServerPlayersResponse,
  ServerRulesResponse,
  ServerHealthResponse,
  ServerDiagnoseResponse,
  ServerOverviewResponse,
  ServerCompareResponse,
  ServerTrendResponse,
  ServerAlertResponse,
  ServerTrendEntry,
  ServerState,
} from "../../contracts/monitoring.types.js";

/** ping + 플레이어 비율 기반 HealthStatus 평가 */
function evaluateHealth(
  ping: number,
  players: number,
  maxPlayers: number
): { health: HealthStatus; reason?: string } {
  if (ping < 0) return { health: "CRITICAL", reason: "서버 응답 없음 (오프라인)" };
  const ratio = maxPlayers > 0 ? players / maxPlayers : 0;
  if (ping > 300) return { health: "WARNING", reason: `높은 ping: ${ping}ms` };
  if (ratio > 0.95) return { health: "HIGH_LOAD", reason: `서버 용량 초과 (${Math.round(ratio * 100)}%)` };
  if (ping > 200) return { health: "WARNING", reason: `ping 주의: ${ping}ms` };
  return { health: "GOOD" };
}

/** 상세 진단 메시지 생성 */
function buildAnalysis(ping: number, players: number, maxPlayers: number, map: string): string[] {
  const analysis: string[] = [];
  const latency = getLatencyCategory(ping);

  if (ping < 0) {
    analysis.push("서버가 응답하지 않습니다. 오프라인 상태이거나 네트워크 문제가 있습니다.");
  } else {
    analysis.push(`현재 ping: ${ping}ms (${latency})`);
  }

  if (maxPlayers > 0) {
    const ratio = players / maxPlayers;
    analysis.push(`플레이어: ${players}/${maxPlayers} (${Math.round(ratio * 100)}%)`);
    if (ratio > 0.95) analysis.push("경고: 서버 용량이 거의 꽉 찼습니다.");
  }

  analysis.push(`현재 맵: ${map}`);
  return analysis;
}

export async function getServerQuery(serverId: string): Promise<ServerQueryResponse> {
  return queryWithDedup(serverId);
}

export async function getServerPlayers(serverId: string): Promise<ServerPlayersResponse> {
  const state = await queryWithDedup(serverId);
  return { playerList: state.playerList ?? [] };
}

export async function getServerRules(serverId: string): Promise<ServerRulesResponse> {
  const state = await queryWithDedup(serverId);
  return { rules: state.rules ?? {} };
}

export async function getServerHealth(serverId: string): Promise<ServerHealthResponse> {
  const state = await queryWithDedup(serverId);
  const { health, reason } = evaluateHealth(state.ping, state.players, state.maxPlayers);
  return { ...state, health, ...(reason ? { reason } : {}) };
}

export async function getServerDiagnose(serverId: string): Promise<ServerDiagnoseResponse> {
  const state = await queryWithDedup(serverId);
  const { health: status, reason } = evaluateHealth(state.ping, state.players, state.maxPlayers);
  const analysis = buildAnalysis(state.ping, state.players, state.maxPlayers, state.map);
  return { ...state, status, ...(reason ? { reason } : {}), analysis };
}

export async function getServerOverview(): Promise<ServerOverviewResponse> {
  const servers = getQueryableServers();
  const results = await Promise.allSettled(servers.map((s) => queryWithDedup(s.id)));

  const successStates: ServerState[] = [];
  const errors: string[] = [];

  // noUncheckedIndexedAccess 대응: forEach로 안전하게 처리
  results.forEach((result, i) => {
    const server = servers[i];
    if (!server) return;

    if (result.status === "fulfilled") {
      successStates.push(result.value);
    } else {
      const msg = result.reason instanceof Error ? result.reason.message : "쿼리 실패";
      errors.push(`${server.id}: ${msg}`);
    }
  });

  return {
    servers: successStates,
    ...(errors.length > 0 ? { errors } : {}),
  };
}

export async function getServerCompare(serverIds?: string[]): Promise<ServerCompareResponse> {
  const allServers = getQueryableServers();
  const targetIds = serverIds?.length ? serverIds : allServers.map((s) => s.id);

  const results = await Promise.allSettled(targetIds.map((id) => queryWithDedup(id)));

  const states: ServerState[] = results
    .filter(
      (r): r is PromiseFulfilledResult<ServerState> => r.status === "fulfilled"
    )
    .map((r) => r.value);

  if (states.length === 0) {
    return { servers: [], recommendation: "조회 가능한 서버가 없습니다." };
  }

  // ping 낮고 여유 공간 있는 서버 추천
  const best = states.reduce((prev, curr) => {
    const prevRatio = prev.maxPlayers > 0 ? prev.players / prev.maxPlayers : 1;
    const currRatio = curr.maxPlayers > 0 ? curr.players / curr.maxPlayers : 1;
    if (curr.ping >= 0 && curr.ping < prev.ping && currRatio < 0.9) return curr;
    if (prev.ping < 0 && curr.ping >= 0) return curr;
    return prevRatio < currRatio ? prev : curr;
  });

  return {
    servers: states,
    recommendation: `추천 서버: ${best.name} (ping: ${best.ping}ms, ${best.players}/${best.maxPlayers} 플레이어)`,
  };
}

export async function getServerTrend(serverId: string): Promise<ServerTrendResponse> {
  // 최신 샘플 누적을 위해 쿼리 시도 (오프라인이어도 기존 히스토리 반환)
  try {
    await queryWithDedup(serverId);
  } catch {
    // 실패해도 기존 트렌드 히스토리는 반환
  }

  const history = getTrendHistory(serverId);
  const trendEntries: ServerTrendEntry[] = history.map((s) => ({
    timestamp: new Date(s.ts).toISOString(),
    players: s.players,
    ping: s.ping,
  }));

  return { serverId, history: trendEntries };
}

export async function getServerAlerts(): Promise<ServerAlertResponse> {
  const servers = getQueryableServers();
  const results = await Promise.allSettled(servers.map((s) => queryWithDedup(s.id)));

  const alerts: ServerAlertResponse = [];

  // noUncheckedIndexedAccess 대응: forEach로 안전하게 처리
  results.forEach((result, i) => {
    const server = servers[i];
    if (!server) return;

    if (result.status === "rejected") {
      alerts.push({ serverId: server.id, alertType: "OFFLINE" });
      return;
    }

    const state = result.value;
    if (state.ping > 300) {
      alerts.push({ serverId: server.id, alertType: "HIGH_PING" });
    }
    const ratio = state.maxPlayers > 0 ? state.players / state.maxPlayers : 0;
    if (ratio > 0.95) {
      alerts.push({ serverId: server.id, alertType: "HIGH_LOAD" });
    }
  });

  return alerts;
}
