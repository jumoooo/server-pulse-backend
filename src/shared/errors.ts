/**
 * 공통 에러 클래스 및 Hono 에러 핸들러
 */

import type { Context } from "hono";
import { logger } from "./logger.js";

/** 비즈니스 에러 (4xx) */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

/** 아직 구현되지 않은 기능 (개발 중 스텁용) */
export class NotImplementedError extends AppError {
  constructor(feature: string) {
    super(501, `[TODO] ${feature}는 아직 구현되지 않았습니다.`);
    this.name = "NotImplementedError";
  }
}

/** Hono 글로벌 에러 핸들러 */
export function errorHandler(err: Error, c: Context): Response {
  if (err instanceof AppError) {
    logger.warn("AppError", { status: err.statusCode, msg: err.message });
    return c.json({ ok: false, error: err.message }, err.statusCode as Parameters<Context["json"]>[1]);
  }

  logger.error("UnhandledError", { msg: err.message, stack: err.stack });
  return c.json({ ok: false, error: "서버 내부 오류가 발생했습니다." }, 500);
}
