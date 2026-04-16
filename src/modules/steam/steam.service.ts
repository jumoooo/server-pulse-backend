/**
 * Steam API 서비스 레이어
 * steam_mcp의 steam-api/client.ts 로직을 HTTP 서비스로 이식
 */

import { requireSteamApiKey } from "../../shared/env.js";
import type {
  ResolveVanityResponse,
  PlayerSummaryResponse,
  OwnedGamesResponse,
  RecentlyPlayedResponse,
  CurrentPlayersResponse,
  ServersAtAddressResponse,
  AppNewsResponse,
  PlayerSummary,
  OwnedGame,
  GameServer,
  NewsItem,
} from "../../contracts/steam.types.js";

const STEAM_API_BASE = "https://api.steampowered.com";
const STEAM_STORE_BASE = "https://store.steampowered.com";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Steam API 오류 (${res.status}): ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/** 커스텀 URL → SteamID 변환 */
export async function resolveVanityUrl(vanityurl: string): Promise<ResolveVanityResponse> {
  const key = requireSteamApiKey();
  const url = `${STEAM_API_BASE}/ISteamUser/ResolveVanityURL/v0001/?key=${key}&vanityurl=${encodeURIComponent(vanityurl)}`;
  const data = await fetchJson<{ response: { steamid?: string; success: number; message?: string } }>(url);
  if (data.response.success !== 1 || !data.response.steamid) {
    throw new Error(data.response.message ?? "해당 커스텀 URL을 찾을 수 없습니다.");
  }
  return { steamid: data.response.steamid };
}

/** 프로필 요약 조회 */
export async function getPlayerSummary(steamids: string): Promise<PlayerSummaryResponse> {
  const key = requireSteamApiKey();
  const url = `${STEAM_API_BASE}/ISteamUser/GetPlayerSummaries/v0002/?key=${key}&steamids=${steamids}`;
  const data = await fetchJson<{ response: { players: PlayerSummary[] } }>(url);
  return { players: data.response.players ?? [] };
}

/** 보유 게임 목록 */
export async function getOwnedGames(
  steamid: string,
  options?: { include_appinfo?: boolean; include_played_free_games?: boolean }
): Promise<OwnedGamesResponse> {
  const key = requireSteamApiKey();
  const params = new URLSearchParams({
    key,
    steamid,
    include_appinfo: String(options?.include_appinfo ?? true),
    include_played_free_games: String(options?.include_played_free_games ?? false),
  });
  const url = `${STEAM_API_BASE}/IPlayerService/GetOwnedGames/v0001/?${params}`;
  const data = await fetchJson<{ response: { games?: OwnedGame[]; game_count: number } }>(url);
  return {
    games: data.response.games ?? [],
    game_count: data.response.game_count ?? 0,
  };
}

/** 최근 플레이 게임 */
export async function getRecentlyPlayed(steamid: string, count?: number): Promise<RecentlyPlayedResponse> {
  const key = requireSteamApiKey();
  const params = new URLSearchParams({ key, steamid });
  if (count) params.set("count", String(count));
  const url = `${STEAM_API_BASE}/IPlayerService/GetRecentlyPlayedGames/v0001/?${params}`;
  const data = await fetchJson<{ response: { games?: OwnedGame[] } }>(url);
  return { games: data.response.games ?? [] };
}

/** 동시 접속자 수 */
export async function getCurrentPlayers(appid: number): Promise<CurrentPlayersResponse> {
  const url = `${STEAM_API_BASE}/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${appid}`;
  const data = await fetchJson<{ response: { player_count: number } }>(url);
  return { appid, player_count: data.response.player_count };
}

/** IP로 서버 목록 조회 */
export async function getServersAtAddress(addr: string): Promise<ServersAtAddressResponse> {
  const url = `${STEAM_API_BASE}/ISteamApps/GetServersAtAddress/v1/?addr=${encodeURIComponent(addr)}`;
  const data = await fetchJson<{ response: { servers?: GameServer[]; success?: boolean } }>(url);
  return { servers: data.response.servers ?? [] };
}

/** 앱 뉴스/패치노트 */
export async function getAppNews(
  appid: number,
  count = 5,
  maxlength = 300
): Promise<AppNewsResponse> {
  const url = `${STEAM_STORE_BASE}/api/appnews/?appid=${appid}&count=${count}&maxlength=${maxlength}&format=json`;
  const data = await fetchJson<{ appnews?: { newsitems: NewsItem[] } }>(url);
  return {
    appid,
    newsitems: data.appnews?.newsitems ?? [],
  };
}
