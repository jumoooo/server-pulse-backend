/**
 * Game Server 모니터링 계약 타입
 * steam_mcp의 game-server/types.ts를 HTTP API 응답 형태로 래핑
 */

export type LatencyCategory = "GOOD" | "NORMAL" | "HIGH" | "CRITICAL";
export type HealthStatus = "GOOD" | "WARNING" | "HIGH_LOAD" | "CRITICAL";
export type AlertType = "OFFLINE" | "HIGH_PING" | "HIGH_LOAD";

/** 정규화된 게임 서버 상태 */
export interface ServerState {
  id: string;
  name: string;
  map: string;
  players: number;
  maxPlayers: number;
  ping: number;
  game: string;
  latencyCategory: LatencyCategory;
  playerList?: ServerPlayer[];
  rules?: Record<string, string>;
  queriedAt: string;
}

export interface ServerPlayer {
  name: string;
  score?: number;
  time?: number;
}

// ---- HTTP 응답 DTO ----

export interface ServerQueryResponse extends ServerState {}

export interface ServerPlayersResponse {
  playerList: ServerPlayer[];
}

export interface ServerRulesResponse {
  rules: Record<string, string>;
}

export interface ServerHealthResponse extends ServerState {
  health: HealthStatus;
  reason?: string;
}

export interface ServerDiagnoseResponse extends ServerState {
  status: HealthStatus;
  reason?: string;
  analysis: string[];
}

export interface ServerCompareResponse {
  servers: ServerState[];
  recommendation: string;
}

export interface ServerTrendEntry {
  timestamp: string;
  players: number;
  ping: number;
}

export interface ServerTrendResponse {
  serverId: string;
  history: ServerTrendEntry[];
}

export interface ServerOverviewResponse {
  servers: ServerState[];
  errors?: string[];
}

export interface ServerAlertItem {
  serverId: string;
  alertType: AlertType;
}

export type ServerAlertResponse = ServerAlertItem[];
