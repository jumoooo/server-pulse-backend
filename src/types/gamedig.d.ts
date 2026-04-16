/**
 * gamedig v5 ambient 타입 선언
 * 공식 @types 패키지가 없으므로 직접 최소 타입 정의
 */

declare module "gamedig" {
  export interface GamedigPlayer {
    name: string;
    score?: number;
    time?: number;
    raw?: Record<string, unknown>;
  }

  export interface GamedigResult {
    name: string;
    map: string;
    players: GamedigPlayer[];
    maxplayers: number;
    numplayers: number;
    ping: number;
    raw: Record<string, unknown>;
    connect?: string;
    password?: boolean;
  }

  export interface GamedigOptions {
    type: string;
    host: string;
    port?: number;
    maxRetries?: number;
    socketTimeout?: number;
    attemptTimeout?: number;
    requestPlayers?: boolean;
    [key: string]: unknown;
  }

  export class GameDig {
    constructor(options?: Record<string, unknown>);
    query(options: GamedigOptions): Promise<GamedigResult>;
    static getInstance(): GameDig;
    static query(options: GamedigOptions): Promise<GamedigResult>;
  }
}
