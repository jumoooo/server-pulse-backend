/**
 * 게임 서버 데이터 모델 (내부용)
 * contracts/monitoring.types.ts의 타입과 동일하나 game-server 모듈 내부에서 참조용으로 분리
 */

export type LatencyCategory = "GOOD" | "NORMAL" | "HIGH" | "CRITICAL";

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

export type HealthStatus = "GOOD" | "WARNING" | "HIGH_LOAD" | "CRITICAL";

/** 트렌드 샘플 — ping 포함 (백엔드 계약 요구사항) */
export interface TrendSample {
  ts: number;
  players: number;
  ping: number;
}
