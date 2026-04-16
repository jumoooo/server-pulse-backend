/**
 * Steam 도메인 계약 타입
 * steam_mcp의 steam-api/types.ts를 HTTP API 응답 형태로 래핑
 */

/** Steam 사용자 프로필 요약 */
export interface PlayerSummary {
  steamid: string;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  personastate: number;
  communityvisibilitystate: number;
  realname?: string;
  timecreated?: number;
  loccountrycode?: string;
  gameextrainfo?: string;
  gameid?: string;
}

/** 보유/최근 플레이 게임 */
export interface OwnedGame {
  appid: number;
  name: string;
  playtime_forever: number;
  img_icon_url: string;
  playtime_2weeks?: number;
}

/** Steam 게임 서버 (ISteamApps/GetServersAtAddress 응답) */
export interface GameServer {
  addr: string;
  gameport: number;
  steamid: string;
  name: string;
  appid: number;
  gamedir: string;
  version: string;
  product: string;
  region: number;
  players: number;
  max_players: number;
  bots: number;
  map: string;
  secure: boolean;
  dedicated: boolean;
  os: string;
  gametype: string;
}

/** 앱 뉴스 아이템 */
export interface NewsItem {
  gid: string;
  title: string;
  url: string;
  is_external_url: boolean;
  author: string;
  contents: string;
  feedlabel: string;
  date: number;
  feedname: string;
  appid: number;
}

// ---- HTTP 응답 DTO ----

export interface ResolveVanityResponse {
  steamid: string;
}

export interface PlayerSummaryResponse {
  players: PlayerSummary[];
}

export interface OwnedGamesResponse {
  game_count: number;
  games: OwnedGame[];
}

export interface RecentlyPlayedResponse {
  games: OwnedGame[];
}

export interface CurrentPlayersResponse {
  appid: number;
  player_count: number;
}

export interface ServersAtAddressResponse {
  servers: GameServer[];
}

export interface AppNewsResponse {
  appid: number;
  newsitems: NewsItem[];
}
