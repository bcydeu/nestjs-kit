---
'@yunhak/nestjs-kit': minor
---

feat: `/slack` 서브패스 추가 — `SlackModule.forRootAsync` + Incoming Webhook 전략. 전역 `fetch`(Node 22+)로 동작해 추가 peer 없이 사용 가능.

- `SlackService`: 저수준 `send`, 한줄 알림 `notify(text)`, 에러 알림 `sendError(error, options)` 제공.
- 에러 알림은 심각도 `level`('warn'|'error'|'fatal')을 attachment color 바로 표현하고, 모듈 옵션 `environment`를 헤더에 표시하며, 메시지·context·스택(길이 제한)을 포매팅.
- `/config`에 `SlackOptions`(webhookUrl 검증) 추가.
- `/email` README 예시를 실제 `forRootAsync` API에 맞게 수정.
