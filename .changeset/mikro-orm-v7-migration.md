---
'@yunhak/nestjs-kit': minor
---

MikroORM v6 → v7 마이그레이션 (BREAKING).

### 소비처 영향

- **Node 22.17+** 필요 (v7 require(esm) 지원 요건).
- peer 의존성을 `@mikro-orm/* ^7`로 올리고, 데코레이터 패키지 **`@mikro-orm/decorators` 설치 필요** (v7은 데코레이터를 core에서 분리).
- DB 설정에서 **`pool.acquireTimeoutMillis` 제거** (v7 `PoolConfig`에서 삭제됨 — knex→kysely 전환). 연결 획득 타임아웃이 필요하면 `driverOptions`로 pg `connectionTimeoutMillis`를 전달.
- `strict`가 항상 활성화됨 (v7에서 옵션 제거). 매핑되지 않은 속성 처리 등이 더 엄격해질 수 있음.

### 내부 변경 (소비처 API 영향 없음)

- 데코레이터 import 경로를 `@mikro-orm/core` → `@mikro-orm/decorators/legacy`로 변경.
- tsconfig `module`/`moduleResolution`을 `nodenext`로 전환 (CJS 빌드 유지).
- 테스트 러너를 **jest → vitest**로 교체 (v7 native ESM 비호환). `unplugin-swc`로 `emitDecoratorMetadata` 보존.
- optional peer(`resend`, `@sentry/nestjs`) 클라이언트를 모듈 provider에서 생성해 주입하도록 리팩토링 (서비스가 직접 require하지 않음). `EmailModule`/`SentryLoggerModule`의 공개 API는 동일.
