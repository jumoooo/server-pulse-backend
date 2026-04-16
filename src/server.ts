/**
 * Node.js 서버 진입점
 * pnpm dev → tsx watch src/server.ts
 * pnpm start → node dist/server.js
 */

import { serve } from "@hono/node-server";
import { app } from "./app.js";
import { env } from "./shared/env.js";
import { logger } from "./shared/logger.js";

const server = serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    logger.info("서버 시작", {
      port: info.port,
      env: env.NODE_ENV,
      cors: env.CORS_ORIGIN,
    });
    if (env.NODE_ENV === "development") {
      console.log(`
  ┌─────────────────────────────────────┐
  │  ServerPulse Backend                │
  │  http://localhost:${info.port}              │
  │  GET /health                        │
  │  GET /api/steam/player/:steamId     │
  │  GET /api/servers/overview          │
  └─────────────────────────────────────┘
`);
    }
  }
);

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM 수신 — 서버 종료 중...");
  server.close(() => {
    logger.info("서버 종료 완료");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT 수신 — 서버 종료 중...");
  server.close(() => {
    logger.info("서버 종료 완료");
    process.exit(0);
  });
});
