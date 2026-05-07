# ServerPulse — Backend

게임 서버 실시간 관측 API 서버입니다.  
Steam API와 gamedig를 통해 게임 서버 상태를 조회하고, 헬스·트렌드·진단 데이터를 제공합니다.

---

## 기술 스택

| 레이어 | 선택 |
|--------|------|
| Framework | Hono 4 |
| Runtime | Node.js 22 ESM |
| Language | TypeScript 5.8 (strict) |
| Validation | Zod |
| 테스트 | Vitest |
| 패키지 매니저 | pnpm |

---

## 시작하기

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경 변수 설정

```bash
cp .env.example .env.local
```

`.env.local` 파일에 아래 값을 입력합니다.

```bash
PORT=4000
STEAM_API_KEY=        # Steam API 키 (Steam 관련 엔드포인트에 필요)
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
NODE_ENV=development
```

### 3. 개발 서버 실행

```bash
pnpm dev
```

[http://localhost:4000](http://localhost:4000) 에서 실행됩니다.

---

## API 엔드포인트

| 엔드포인트 | 설명 | Frontend 연결 |
|-----------|------|--------------|
| `GET /health` | 서버 가용 여부 확인 | ✅ 연결됨 |
| `GET /api/servers/overview` | 전체 서버 요약 | ✅ 연결됨 (대시보드) |
| `GET /api/servers/:id/health` | 단일 서버 헬스 | ✅ 연결됨 (서버 상세) |
| `GET /api/servers/:id/trend` | 플레이어 수 추이 | ✅ 연결됨 (서버 상세 차트) |
| `GET /api/servers/:id/players` | 현재 플레이어 목록 | ✅ 연결됨 (서버 상세) |
| `GET /api/servers/:id/diagnose` | 서버 진단 정보 | ✅ 연결됨 (서버 상세) |
| `GET /api/servers/:id` | 단일 서버 정보 | — |
| `GET /api/servers/alert` | 이상 서버 목록 | — |
| `GET /api/servers/compare` | 서버 비교 | — |
| `GET /api/steam/*` | Steam API 직접 조회 | — |

모든 응답은 아래 형식을 따릅니다.

```json
{ "ok": true, "data": { ... } }
{ "ok": false, "error": "에러 메시지" }
```

---

## 환경 변수

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `PORT` | `4000` | 서버 포트 |
| `STEAM_API_KEY` | 없음 | Steam API 키 |
| `CORS_ORIGIN` | `http://localhost:3000` | 허용 오리진 |
| `LOG_LEVEL` | `info` | 로그 레벨 |
| `NODE_ENV` | `development` | 실행 환경 |

---

## 디렉터리 구조

```
src/
├── app.ts                  # Hono 앱 구성, CORS, 라우터 조립
├── server.ts               # Node 서버 진입점
├── modules/
│   ├── steam/              # Steam API 모듈
│   └── monitoring/         # 모니터링 API 모듈
├── game-server/            # gamedig 조회, 캐시, 트렌드
├── config/
│   └── servers.ts          # servers.json 로더
└── shared/                 # env, logger, 에러 핸들러
```

---

## 개발 명령어

```bash
pnpm dev          # 개발 서버 실행
pnpm build        # TypeScript 빌드
pnpm start        # 빌드 결과 실행
pnpm typecheck    # TypeScript 타입 검사
pnpm test         # Vitest 테스트 실행
```

---

## 참고 사항

- 플레이어 추이(`/trend`) 히스토리는 인메모리로 관리됩니다. 서버 재시작 시 초기화됩니다.
- `STEAM_API_KEY`가 없으면 Steam API 관련 엔드포인트가 정상 동작하지 않습니다.
- `servers.json`에 정의된 서버 ID가 frontend에서 참조하는 ID와 일치해야 합니다.
- frontend(`localhost:3000`)와 연동하려면 `CORS_ORIGIN=http://localhost:3000`으로 설정하세요.
