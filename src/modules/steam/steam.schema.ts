/**
 * Steam 모듈 Zod 입력 스키마
 */

import { z } from "zod";

export const vanityUrlSchema = z.object({
  vanityurl: z.string().min(2).max(32),
});

export const steamIdsSchema = z.object({
  steamids: z.string().regex(/^[\d,]+$/, "쉼표로 구분된 17자리 SteamID"),
});

export const steamIdSchema = z.object({
  steamid: z.string().regex(/^\d{17}$/, "17자리 SteamID 형식이어야 합니다"),
});

export const appIdSchema = z.object({
  appid: z.coerce.number().int().min(0),
});

export const addrSchema = z.object({
  addr: z.string().regex(/^[\d.]+(:\d{1,5})?$/, "IP 또는 IP:포트 형식 (예: 192.168.1.1:27015)"),
});

export const ownedGamesQuerySchema = steamIdSchema.extend({
  include_appinfo: z.coerce.boolean().default(true),
  include_played_free_games: z.coerce.boolean().default(false),
});

export const recentlyPlayedQuerySchema = steamIdSchema.extend({
  count: z.coerce.number().int().min(1).max(100).optional(),
});

export const appNewsQuerySchema = appIdSchema.extend({
  count: z.coerce.number().int().min(1).max(20).default(5),
  maxlength: z.coerce.number().int().min(0).default(300),
});
