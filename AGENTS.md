# ServerPulse Backend AGENTS

## 목적

- 이 저장소는 `server-pulse-backend` backend 제품 코드 저장소예요.
- 새 채팅이 열려도 이슈, 브랜치, 커밋, PR 위치를 바로 판단할 수 있게 하는 package-local 안내예요.

## 기본 규칙

- 새 작업이나 새 변경 요청이 들어오면, 바로 구현에 들어가기 전에 **issue를 먼저 만들지 사용자에게 짧게 확인**해요.
- 사용자가 승인하면 이 저장소에 issue를 만들고, 그 issue 기준으로 브랜치/커밋/PR를 진행해요.
- backend 기능, 버그, typecheck, test, `/health` 관련 작업은 **이 저장소에서** 이슈를 만들고 브랜치/커밋/PR를 진행해요.
- root 운영 문서, handoff, gate, harness, `.cursor`, `.codex`, `.agents` 변경은 **`jumoooo/server-pulse-root-ops`** 에서 처리해요.
- frontend 소비 코드와 함께 바뀌는 작업이면 **root parent issue + frontend child issue** 구조로 나눠서 진행해요.
- 같은 저장소 이슈를 닫을 때만 `Closes #번호`를 써요.
- root 상위 이슈는 `Refs jumoooo/server-pulse-root-ops#번호`로 연결해요.

## 이 저장소에서 처리하는 작업

- API 라우트와 응답 계약
- 환경 변수, CORS, 포트, `/health`
- backend 테스트와 런타임 스모크
- Steam / monitoring 모듈 구현

## 작업 전 체크

- frontend가 소비하는 응답 계약이 바뀌는지 확인해요.
- 교차 작업이면 `port / CORS / env` 정합 메모를 PR에 남겨요.
- 구현 PR에는 `typecheck`, `test`, `/health` 확인 결과를 함께 남겨요.

## 빠른 판단

| 변경 내용 | 작업 위치 |
|---|---|
| API, env, CORS, `/health`, backend 테스트 | `jumoooo/server-pulse-backend` |
| UI, 페이지, 컴포넌트, frontend 테스트 | `jumoooo/server-pulse` |
| handoff, gate, Codex/Cursor 운영 문서 | `jumoooo/server-pulse-root-ops` |
| frontend + backend 동시 변경 | root parent issue + 각 저장소 child issue |
