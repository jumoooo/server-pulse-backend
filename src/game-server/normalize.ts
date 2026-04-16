/**
 * gamedig raw 결과 → ServerState 정규화
 */

import type { GamedigResult } from "gamedig";
import type { ServerState, LatencyCategory, ServerPlayer } from "./types.js";

export function getLatencyCategory(ping: number): LatencyCategory {
  if (ping < 0) return "CRITICAL";
  if (ping <= 100) return "GOOD";
  if (ping <= 200) return "NORMAL";
  if (ping <= 300) return "HIGH";
  return "CRITICAL";
}

export function normalize(raw: GamedigResult, serverId: string): ServerState {
  const ping = raw.ping ?? -1;

  const playerList: ServerPlayer[] | undefined = raw.players?.map((p) => ({
    name: p.name || "Unknown",
    score: p.score,
    time: p.time,
  }));

  const playerCount = raw.players?.length ?? raw.numplayers ?? 0;

  // gamedig raw 객체를 rules로 직접 쓰되, 값을 string으로 강제 변환해 타입 계약 충족
  const rulesRaw = raw.raw;
  const rules: Record<string, string> | undefined = rulesRaw
    ? Object.fromEntries(
        Object.entries(rulesRaw).map(([k, v]) => [k, String(v)])
      )
    : undefined;

  return {
    id: serverId,
    name: (raw.name ?? "Unknown").trim(),
    map: raw.map ?? "Unknown",
    players: playerCount,
    maxPlayers: raw.maxplayers ?? 0,
    ping,
    game: (raw.raw?.["game"] as string | undefined) ?? "unknown",
    latencyCategory: getLatencyCategory(ping),
    playerList: playerList?.length ? playerList : undefined,
    rules,
    queriedAt: new Date().toISOString(),
  };
}
