/**
 * Hono 앱 설정
 * CORS, 에러 핸들러, 라우터 마운트
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger as honoLogger } from "hono/logger";
import { env } from "./shared/env.js";
import { errorHandler } from "./shared/errors.js";
import { logger } from "./shared/logger.js";
import { steamRouter } from "./modules/steam/steam.routes.js";
import { monitoringRouter } from "./modules/monitoring/monitoring.routes.js";

const app = new Hono();

// 요청 로깅 (개발 모드)
if (env.NODE_ENV === "development") {
  app.use("*", honoLogger());
}

// CORS — 프론트엔드(:3000)에서 백엔드(:4000) 호출 허용
const allowedOrigins = env.CORS_ORIGIN.split(",").map((o) => o.trim());

app.use(
  "*",
  cors({
    origin: allowedOrigins,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400,
  })
);

// 헬스체크
app.get("/health", (c) => {
  return c.json({
    ok: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "0.1.0",
  });
});

// 라우터 마운트
app.route("/api/steam", steamRouter);
app.route("/api/servers", monitoringRouter);

// 404
app.notFound((c) => {
  logger.warn("404 Not Found", { path: c.req.path });
  return c.json({ ok: false, error: `경로를 찾을 수 없습니다: ${c.req.path}` }, 404);
});

// 전역 에러 핸들러
app.onError((err, c) => errorHandler(err, c));

export { app };
