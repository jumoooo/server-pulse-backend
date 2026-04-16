/**
 * server_trend - 최대 20샘플, ping 포함
 */

import type { TrendSample } from "./types.js";

const MAX_SAMPLES = 20;
const trendHistory = new Map<string, TrendSample[]>();

/** 샘플 추가 (최대 20개 유지) */
export function pushTrendSample(serverId: string, players: number, ping: number): void {
  const arr = trendHistory.get(serverId) ?? [];
  arr.push({ ts: Date.now(), players, ping });
  if (arr.length > MAX_SAMPLES) arr.shift();
  trendHistory.set(serverId, arr);
}

export function getTrendHistory(serverId: string): TrendSample[] {
  return trendHistory.get(serverId) ?? [];
}

export function computeTrend(history: TrendSample[]): "increasing" | "decreasing" | "stable" {
  if (history.length < 2) return "stable";
  // noUncheckedIndexedAccess 대응: undefined 가드 추가
  const first = history[0];
  const last = history[history.length - 1];
  if (!first || !last) return "stable";
  const diff = last.players - first.players;
  if (diff > 0) return "increasing";
  if (diff < 0) return "decreasing";
  return "stable";
}
