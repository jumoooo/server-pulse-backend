# ServerPulse Backend

> Hono + TypeScript 기반 관측 API예요.  
> Steam API와 게임 서버 상태 조회, 헬스, 비교, 트렌드 기능을 제공해요.

## 먼저 이렇게 실행해요

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

기본 포트는 `http://localhost:4000`이에요.

## 이 백엔드의 역할

이 패키지는 frontend의 메인 CRUD 서버라기보다,  
**게임 서버 실시간 조회와 진단을 담당하는 관측 API**에 가까워요.

현재 frontend와의 관계:

- frontend는 자체 Prisma 데이터를 주력으로 사용해요.
- 이 backend는 frontend 서버 상세 화면의 실시간 헬스 패널 같은 일부 기능에 연결돼 있어요.

## 제공 기능

| 영역 | 설명 |
|---|---|
| `/health` | 서버 상태 확인 |
| `/api/steam/*` | Steam 관련 조회 |
| `/api/servers/overview` | 전체 서버 상태 요약 |
| `/api/servers/alert` | 이상 징후 서버 추출 |
| `/api/servers/compare` | 서버 비교와 추천 |
| `/api/servers/:id` | 단일 서버 상태 |
| `/api/servers/:id/players` | 플레이어 목록 |
| `/api/servers/:id/rules` | 서버 규칙 |
| `/api/servers/:id/health` | 헬스 판정 |
| `/api/servers/:id/diagnose` | 진단 정보 |
| `/api/servers/:id/trend` | 플레이어 추이 |

## 환경 변수

`.env.example`를 복사해서 `.env.local`로 써요.

| 변수 | 기본값 | 설명 |
|---|---|---|
| `PORT` | `4000` | 서버 포트 |
| `STEAM_API_KEY` | 없음 | Steam API 키 |
| `CORS_ORIGIN` | `http://localhost:3000` | 허용 오리진 |
| `LOG_LEVEL` | `info` | 로그 레벨 |
| `NODE_ENV` | `development` | 실행 환경 |

## 프론트와의 정합 기준

| 항목 | 기대값 |
|---|---|
| backend 포트 | `4000` |
| frontend API base | `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000` |
| CORS 허용 | `CORS_ORIGIN=http://localhost:3000` |

이 세 값이 어긋나면 frontend에서 backend 헬스 패널 호출이 깨질 수 있어요.

## 스크립트

| 명령 | 설명 |
|---|---|
| `pnpm dev` | 개발 서버 실행 |
| `pnpm build` | TypeScript 빌드 |
| `pnpm start` | 빌드 결과 실행 |
| `pnpm typecheck` | TypeScript 검사 |
| `pnpm test` | Vitest 실행 |

## 검증 메모

마지막 검증: 2026-04-30 (로컬, Node v22.21.0 / pnpm v10.26.1)

- ✅ `pnpm typecheck` 통과 — exit 0
- ✅ `pnpm build` 통과 — exit 0
- ✅ `pnpm test` 통과 — 3/3 (exit 0)

이전 `spawn EPERM`은 Codex sandbox 전용 제약으로 분류됨. 로컬 환경에서는 재현 안 됨.

## `servers.json` 운영 규칙

- 모니터링 대상 서버 목록은 `servers.json`에서 읽어요.
- 각 서버 `id`는 frontend에서 참조하는 서버 식별자와 맞아야 해요.
- `id`가 어긋나면 frontend의 backend 헬스 패널 연결이 실패할 수 있어요.

## 응답 형식

모든 엔드포인트는 아래 래퍼를 기본으로 사용해요.

```json
{ "ok": true, "data": { ... } }
```

```json
{ "ok": false, "error": "에러 메시지" }
```

## 디렉터리 가이드

| 경로 | 설명 |
|---|---|
| `src/app.ts` | Hono 앱 구성, CORS, 라우터 조립 |
| `src/server.ts` | Node 서버 진입점 |
| `src/modules/steam/` | Steam API 모듈 |
| `src/modules/monitoring/` | 모니터링 API 모듈 |
| `src/game-server/` | gamedig 조회, 캐시, 트렌드 |
| `src/config/servers.ts` | `servers.json` 로더 |
| `src/shared/` | env, logger, error handler |

## 운영 메모

- 트렌드 히스토리는 인메모리예요.
- 서버 프로세스를 재시작하면 `/api/servers/:id/trend` 히스토리가 초기화돼요.
- `STEAM_API_KEY`가 필요한 엔드포인트는 키가 없으면 정상 동작하지 않아요.

## 협업 메모

- backend 기능/버그/API/env 변경은 이 저장소에서 다뤄요.
- root 운영 문서와 agentic 자산은 root 저장소 책임이에요.
- frontend 소비 코드와 같이 바뀌는 변경은 cross-repo 작업으로 관리하는 게 좋아요.

자세한 기준:

- [backend/AGENTS.md](E:\MY_PROJECTS\NEXT_PROJECT\server-pulse\backend\AGENTS.md)
- [root docs/REPOSITORY_WORKFLOW.md](E:\MY_PROJECTS\NEXT_PROJECT\server-pulse\docs\REPOSITORY_WORKFLOW.md)
- [root docs/2026-04-29_현재-프로젝트-파악.md](E:\MY_PROJECTS\NEXT_PROJECT\server-pulse\docs\2026-04-29_현재-프로젝트-파악.md)
