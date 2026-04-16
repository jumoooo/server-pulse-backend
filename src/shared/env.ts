/**
 * 환경변수 검증 및 타입 안전 접근
 * 서버 시작 시 필수 변수 누락이면 즉시 종료
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value?.trim()) {
    throw new Error(`[env] 필수 환경변수 누락: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, defaultValue: string): string {
  return process.env[key]?.trim() || defaultValue;
}

export const env = {
  PORT: parseInt(optionalEnv("PORT", "4000"), 10),
  STEAM_API_KEY: optionalEnv("STEAM_API_KEY", ""),
  CORS_ORIGIN: optionalEnv("CORS_ORIGIN", "http://localhost:3000"),
  LOG_LEVEL: optionalEnv("LOG_LEVEL", "info"),
  NODE_ENV: optionalEnv("NODE_ENV", "development"),
} as const;

/** 런타임에서 Steam API 키 유무 확인 (라우트 핸들러에서 사용) */
export function requireSteamApiKey(): string {
  if (!env.STEAM_API_KEY) {
    throw new Error("STEAM_API_KEY 환경변수를 설정해주세요.");
  }
  return env.STEAM_API_KEY;
}
