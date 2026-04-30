# ServerPulse Backend

> Hono + TypeScript 기반 백엔드 서비스 (포트 `:4000`)
> Steam API + Game Server 모니터링 HTTP 엔드포인트 제공

## 🤝 협업 규칙

- 새 작업이라고 해서 항상 issue를 먼저 만들지는 않아요.
- 버그, 기능, API 계약 변경, env 변경, cross-repo 작업처럼 **추적 가치가 큰 작업**이면 issue 생성을 먼저 제안해요.
- 오타, 작은 문구 수정, 명백한 잡수정처럼 **소규모 단발 수정**은 issue 없이 바로 진행할 수 있어요.
- issue가 필요한 작업이면 사용자에게 짧게 확인하고, 승인되면 이 저장소에 issue를 만든 뒤 브랜치/커밋/PR를 진행해요.
- backend 기능/버그 이슈, 브랜치, 커밋, PR는 **이 저장소에서** 진행해요.
- root 운영 문서, handoff, gate, harness, `.cursor`, `.codex`, `.agents` 변경은 **[`jumoooo/server-pulse-root-ops`](https://github.com/jumoooo/server-pulse-root-ops)** 에서 진행해요.
- frontend 소비 코드와 API 계약이 함께 바뀌면 **root parent issue + package child issue** 구조로 나눠서 처리해요.
- 같은 저장소 이슈를 닫을 때는 `Closes #번호`를 쓰고, root 상위 이슈는 `Refs jumoooo/server-pulse-root-ops#번호`로 연결해요.
- 교차 작업 PR에는 `port / CORS / env` 정합과 `/health` 확인 결과를 함께 남겨요.
- 자세한 기준은 root 정본 문서 [`docs/REPOSITORY_WORKFLOW.md`](../docs/REPOSITORY_WORKFLOW.md)를 봐주세요.

## 빠른 시작

```bash
# 1. 의존성 설치
pnpm install

# 2. 환경변수 설정
cp .env.example .env.local

# 3. .env.local에 STEAM_API_KEY 입력
# https://steamcommunity.com/dev/apikey

# 4. 개발 서버 실행
pnpm dev
```

### 실행 트러블슈팅

- ⚠️ 프로젝트 폴더를 이동/복사한 뒤에는 기존 `node_modules`를 재사용하지 마세요.
- 🔧 `pnpm dev`에서 `Cannot find package 'esbuild'`가 나오면 아래 순서로 복구하세요.

```bash
rm -rf node_modules
pnpm install
pnpm dev
```

- 🚀 `pnpm start`는 `dist/server.js`가 필요하므로 반드시 먼저 빌드하세요.

```bash
pnpm build
pnpm start
```

현업형 동시 실행:
```bash
# 터미널 A — 백엔드 (이 레포)
pnpm dev   # http://localhost:4000

# 터미널 B — 프론트엔드 (server-pulse)
cd ../server-pulse && pnpm dev   # http://localhost:3000
```

## 제공 기능

| 영역 | 엔드포인트 | frontend 연결 상태 |
|---|---|---|
| 헬스체크 | `/health` | ✅ 연결됨 (백엔드 가용 여부 확인) |
| 전체 서버 요약 | `/api/servers/overview` | ✅ 연결됨 (대시보드) |
| 단일 서버 헬스 | `/api/servers/:id/health` | ✅ 연결됨 (서버 상세 패널) |
| 플레이어 추이 | `/api/servers/:id/trend` | ✅ 연결됨 (서버 상세 차트) |
| 이상 서버 필터 | `/api/servers/alert` | ⏸ 미노출 (보류) |
| 서버 비교 | `/api/servers/compare` | ⏸ 미노출 (보류) |
| 단일 서버 쿼리 | `/api/servers/:id` | ⏸ 미노출 (보류) |
| 플레이어 목록 | `/api/servers/:id/players` | ⏸ 미노출 (보류) |
| 서버 규칙 | `/api/servers/:id/rules` | ⏸ 미노출 (보류) |
| 진단 정보 | `/api/servers/:id/diagnose` | ⏸ 미노출 (보류) |
| Steam API 전체 | `/api/steam/*` | ⏸ 미노출 (보류) |

## 엔드포인트

### 헬스체크
| Method | Path | 설명 |
|--------|------|------|
| GET | `/health` | 서버 상태 확인 |

### Steam API (`/api/steam`)
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/steam/vanity/:vanityurl` | 커스텀 URL → SteamID |
| GET | `/api/steam/player/:steamId` | 프로필 요약 조회 |
| GET | `/api/steam/owned/:steamId` | 보유 게임 목록 |
| GET | `/api/steam/recent/:steamId` | 최근 플레이 게임 |
| GET | `/api/steam/players/:appId` | 동시 접속자 수 |
| GET | `/api/steam/servers?addr=` | IP로 서버 목록 조회 |
| GET | `/api/steam/news/:appId` | 앱 뉴스/패치노트 |

### Game Server 모니터링 (`/api/servers`)
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/servers/overview` | 전체 서버 상태 |
| GET | `/api/servers/alert` | 문제 감지 서버 |
| GET | `/api/servers/compare` | 서버 비교 및 추천 |
| GET | `/api/servers/:id` | 단일 서버 쿼리 |
| GET | `/api/servers/:id/players` | 플레이어 목록 |
| GET | `/api/servers/:id/rules` | 서버 규칙 |
| GET | `/api/servers/:id/health` | 헬스 진단 |
| GET | `/api/servers/:id/diagnose` | AI 진단 |
| GET | `/api/servers/:id/trend` | 플레이어 추이 |

### `servers.json` 운영 규칙

- `servers.json`의 `id`는 프론트 `new_pj`의 서버 식별자와 동일하게 유지해야 합니다.
- `ServerDetail` 실시간 헬스 패널은 해당 `id`를 사용해 `/api/servers/:id/health`를 조회합니다.
- `id` 불일치 시 헬스 패널 조회가 실패할 수 있습니다.

## 응답 형식

모든 엔드포인트는 동일한 래퍼 형식으로 응답합니다:

```json
// 성공
{ "ok": true, "data": { ... } }

// 실패
{ "ok": false, "error": "에러 메시지" }
```

## 환경변수

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `PORT` | `4000` | 서버 포트 |
| `STEAM_API_KEY` | — | Steam Web API 키 (필수) |
| `CORS_ORIGIN` | `http://localhost:3000` | CORS 허용 오리진 |
| `LOG_LEVEL` | `info` | 로그 레벨 |
| `NODE_ENV` | `development` | 실행 환경 |
| `BACKEND_SERVERS_PATH` | `./servers.json` | 모니터링 대상 서버 설정 파일 경로 |

## 디렉터리 구조

```
src/
  app.ts                    # Hono 앱 (CORS, 미들웨어, 라우터)
  server.ts                 # Node 진입점
  config/
    servers.ts              # servers.json 로더
  game-server/
    query.ts                # gamedig 조회
    dedup.ts                # 중복 쿼리 방지
    cache.ts                # TTL 캐시
    normalize.ts            # 응답 정규화
    trend.ts                # 트렌드 히스토리
    types.ts                # 모니터링 내부 타입
  contracts/
    api.types.ts            # 공통 응답 래퍼
    steam.types.ts          # Steam 도메인 타입
    monitoring.types.ts     # 모니터링 도메인 타입
  shared/
    env.ts                  # 환경변수 검증
    logger.ts               # 구조화 로거
    errors.ts               # 공통 에러 처리
  modules/
    steam/                  # Steam API 모듈
    monitoring/             # Game Server 모니터링 API
```

## 운영 메모

- 트렌드 히스토리는 인메모리(`Map`)로 유지됩니다.
- 백엔드 프로세스를 재시작하면 `/api/servers/:id/trend` 히스토리가 초기화됩니다.
- `STEAM_API_KEY`가 필요한 엔드포인트는 키가 없으면 정상 동작하지 않아요.

## 협업 메모

- backend 기능/버그/API/env 변경은 이 저장소에서 다뤄요.
- root 운영 문서와 agentic 자산은 root 저장소 책임이에요.
- frontend 소비 코드와 같이 바뀌는 변경은 cross-repo 작업으로 관리하는 게 좋아요.

자세한 기준:

- [backend/AGENTS.md](E:\MY_PROJECTS\NEXT_PROJECT\server-pulse\backend\AGENTS.md)
- [root docs/REPOSITORY_WORKFLOW.md](E:\MY_PROJECTS\NEXT_PROJECT\server-pulse\docs\REPOSITORY_WORKFLOW.md)
- [root docs/2026-04-29_프로젝트-현황-점검/현재-프로젝트-파악.md](E:\MY_PROJECTS\NEXT_PROJECT\server-pulse\docs\2026-04-29_프로젝트-현황-점검\현재-프로젝트-파악.md)
