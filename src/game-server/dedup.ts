/**
 * 동시 쿼리 Dedup - pendingQueries Map
 * 동일 서버에 대한 중복 요청을 단일 Promise로 합산
 */

import { queryServer } from "./query.js";
import { getCached, setCache } from "./cache.js";
import { pushTrendSample } from "./trend.js";
import type { ServerState } from "./types.js";

const pendingQueries = new Map<string, Promise<ServerState>>();

export async function queryWithDedup(serverId: string): Promise<ServerState> {
  const cached = getCached(serverId);
  if (cached) return cached;

  const existing = pendingQueries.get(serverId);
  if (existing) return existing;

  const promise = queryServer(serverId)
    .then((result) => {
      setCache(serverId, result);
      pendingQueries.delete(serverId);
      pushTrendSample(serverId, result.players, result.ping);
      return result;
    })
    .catch((err: unknown) => {
      pendingQueries.delete(serverId);
      throw err;
    });

  pendingQueries.set(serverId, promise);
  return promise;
}
