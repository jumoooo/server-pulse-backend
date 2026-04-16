/**
 * Monitoring 모듈 Hono 라우트
 * 마운트 경로: /api/servers
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { respond } from "../../contracts/api.types.js";
import * as monitoringService from "./monitoring.service.js";
import { serverIdSchema, serverCompareSchema } from "./monitoring.schema.js";

const monitoring = new Hono();

/** GET /api/servers/overview — 등록된 전체 서버 상태 */
monitoring.get("/overview", async (c) => {
  const data = await monitoringService.getServerOverview();
  return c.json(respond.ok(data));
});

/** GET /api/servers/alert — 문제가 감지된 서버만 필터링 */
monitoring.get("/alert", async (c) => {
  const data = await monitoringService.getServerAlerts();
  return c.json(respond.ok(data));
});

/** GET /api/servers/compare — 서버 비교 및 추천 (?serverIds=id1,id2) */
monitoring.get("/compare", zValidator("query", serverCompareSchema), async (c) => {
  const { serverIds } = c.req.valid("query");
  const ids = serverIds?.split(",").map((s) => s.trim()).filter(Boolean);
  const data = await monitoringService.getServerCompare(ids);
  return c.json(respond.ok(data));
});

/** GET /api/servers/:serverId — 단일 서버 상태 쿼리 */
monitoring.get("/:serverId", zValidator("param", serverIdSchema), async (c) => {
  const { serverId } = c.req.valid("param");
  const data = await monitoringService.getServerQuery(serverId);
  return c.json(respond.ok(data));
});

/** GET /api/servers/:serverId/players — 플레이어 목록 */
monitoring.get("/:serverId/players", zValidator("param", serverIdSchema), async (c) => {
  const { serverId } = c.req.valid("param");
  const data = await monitoringService.getServerPlayers(serverId);
  return c.json(respond.ok(data));
});

/** GET /api/servers/:serverId/rules — 서버 규칙(cvars) */
monitoring.get("/:serverId/rules", zValidator("param", serverIdSchema), async (c) => {
  const { serverId } = c.req.valid("param");
  const data = await monitoringService.getServerRules(serverId);
  return c.json(respond.ok(data));
});

/** GET /api/servers/:serverId/health — 단일 서버 헬스 진단 */
monitoring.get("/:serverId/health", zValidator("param", serverIdSchema), async (c) => {
  const { serverId } = c.req.valid("param");
  const data = await monitoringService.getServerHealth(serverId);
  return c.json(respond.ok(data));
});

/** GET /api/servers/:serverId/diagnose — AI 진단 (원인 분석) */
monitoring.get("/:serverId/diagnose", zValidator("param", serverIdSchema), async (c) => {
  const { serverId } = c.req.valid("param");
  const data = await monitoringService.getServerDiagnose(serverId);
  return c.json(respond.ok(data));
});

/** GET /api/servers/:serverId/trend — 플레이어 수 추이 */
monitoring.get("/:serverId/trend", zValidator("param", serverIdSchema), async (c) => {
  const { serverId } = c.req.valid("param");
  const data = await monitoringService.getServerTrend(serverId);
  return c.json(respond.ok(data));
});

export { monitoring as monitoringRouter };
