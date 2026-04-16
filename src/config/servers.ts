/**
 * servers.json 로더 및 Zod 스키마 검증
 * BACKEND_SERVERS_PATH 환경변수 또는 CWD 기준 ./servers.json 경로 사용
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";

export const ServerSchema = z.object({
  id: z.string().min(1, "서버 ID는 필수입니다"),
  name: z.string().min(1, "서버 이름은 필수입니다"),
  type: z.string().min(1, "게임 타입은 필수입니다"),
  host: z.string().min(1, "호스트는 필수입니다"),
  port: z.number().int().min(1).max(65535),
  query: z
    .object({ enabled: z.boolean().optional().default(true) })
    .optional(),
  logPath: z.string().optional(),
});

export const ServersConfigSchema = z.object({
  servers: z.array(ServerSchema),
});

export type ServerConfig = z.infer<typeof ServerSchema>;
export type ServersConfig = z.infer<typeof ServersConfigSchema>;

function getServersPath(): string {
  const envPath = process.env["BACKEND_SERVERS_PATH"];
  if (envPath) return resolve(envPath);
  return resolve(process.cwd(), "servers.json");
}

export function loadServersConfig(): ServersConfig {
  const path = getServersPath();

  if (!existsSync(path)) {
    throw new Error("servers.json을 찾을 수 없습니다.");
  }

  const raw = readFileSync(path, "utf-8");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("servers.json 형식이 올바르지 않습니다: JSON 파싱 실패");
  }

  const result = ServersConfigSchema.safeParse(parsed);
  if (!result.success) {
    const details = result.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join("; ");
    throw new Error(`servers.json 형식이 올바르지 않습니다: ${details}`);
  }

  return result.data;
}

export function getServerConfig(serverId: string): ServerConfig {
  const config = loadServersConfig();
  const server = config.servers.find((s) => s.id === serverId);
  if (!server) {
    throw new Error("등록되지 않은 서버 ID입니다.");
  }
  return server;
}

export function getQueryableServers(): ServerConfig[] {
  const config = loadServersConfig();
  return config.servers.filter((s) => s.query?.enabled !== false);
}
