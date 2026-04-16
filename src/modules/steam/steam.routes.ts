/**
 * Steam 모듈 Hono 라우트
 * 마운트 경로: /api/steam
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { respond } from "../../contracts/api.types.js";
import * as steamService from "./steam.service.js";
import {
  vanityUrlSchema,
  steamIdsSchema,
  addrSchema,
  appIdSchema,
  ownedGamesQuerySchema,
  recentlyPlayedQuerySchema,
  appNewsQuerySchema,
} from "./steam.schema.js";

const steam = new Hono();

/** GET /api/steam/vanity/:vanityurl — 커스텀 URL → SteamID */
steam.get("/vanity/:vanityurl", async (c) => {
  const { vanityurl } = vanityUrlSchema.parse({ vanityurl: c.req.param("vanityurl") });
  const data = await steamService.resolveVanityUrl(vanityurl);
  return c.json(respond.ok(data));
});

/** GET /api/steam/player — 프로필 요약 (steamids 쿼리: 쉼표 구분 17자리) */
steam.get("/player", zValidator("query", steamIdsSchema), async (c) => {
  const { steamids } = c.req.valid("query");
  const data = await steamService.getPlayerSummary(steamids);
  return c.json(respond.ok(data));
});

/** GET /api/steam/player/:steamId — 단일 SteamID 프로필 */
steam.get("/player/:steamId", async (c) => {
  const steamid = c.req.param("steamId");
  const data = await steamService.getPlayerSummary(steamid);
  return c.json(respond.ok(data));
});

/** GET /api/steam/owned/:steamId — 보유 게임 */
steam.get(
  "/owned/:steamId",
  zValidator("query", ownedGamesQuerySchema.partial().omit({ steamid: true })),
  async (c) => {
    const steamid = c.req.param("steamId");
    const query = c.req.valid("query");
    const data = await steamService.getOwnedGames(steamid, query);
    return c.json(respond.ok(data));
  }
);

/** GET /api/steam/recent/:steamId — 최근 플레이 */
steam.get(
  "/recent/:steamId",
  zValidator("query", recentlyPlayedQuerySchema.partial().omit({ steamid: true })),
  async (c) => {
    const steamid = c.req.param("steamId");
    const { count } = c.req.valid("query");
    const data = await steamService.getRecentlyPlayed(steamid, count);
    return c.json(respond.ok(data));
  }
);

/** GET /api/steam/players/:appId — 동시 접속자 수 */
steam.get("/players/:appId", async (c) => {
  const { appid } = appIdSchema.parse({ appid: Number(c.req.param("appId")) });
  const data = await steamService.getCurrentPlayers(appid);
  return c.json(respond.ok(data));
});

/** GET /api/steam/servers — IP로 서버 조회 (?addr=1.2.3.4:27015) */
steam.get("/servers", zValidator("query", addrSchema), async (c) => {
  const { addr } = c.req.valid("query");
  const data = await steamService.getServersAtAddress(addr);
  return c.json(respond.ok(data));
});

/** GET /api/steam/news/:appId — 앱 뉴스/패치노트 */
steam.get(
  "/news/:appId",
  zValidator("query", appNewsQuerySchema.partial().omit({ appid: true })),
  async (c) => {
    const appid = Number(c.req.param("appId"));
    const { count, maxlength } = c.req.valid("query");
    const data = await steamService.getAppNews(appid, count, maxlength);
    return c.json(respond.ok(data));
  }
);

export { steam as steamRouter };
