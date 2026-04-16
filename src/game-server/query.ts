/**
 * gamedig 쿼리 + timeout 래핑
 */

import { GameDig } from "gamedig";
import { getServerConfig } from "../config/servers.js";
import { normalize } from "./normalize.js";
import type { ServerState } from "./types.js";

export const QUERY_TIMEOUT = 5_000;

function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error("서버 응답 시간 초과")), ms)
  );
}

export async function queryServer(serverId: string): Promise<ServerState> {
  const config = getServerConfig(serverId);

  if (config.query?.enabled === false) {
    throw new Error("해당 서버는 쿼리가 비활성화되어 있습니다.");
  }

  try {
    const raw = await Promise.race([
      GameDig.query({
        type: config.type,
        host: config.host,
        port: config.port,
      }),
      timeout(QUERY_TIMEOUT),
    ]);
    return normalize(raw, serverId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "게임 서버 쿼리 실패";
    if (message.includes("timeout") || message.includes("시간 초과")) {
      throw new Error("서버 응답 시간 초과");
    }
    throw new Error(`게임 서버 쿼리 실패: ${message}`);
  }
}
