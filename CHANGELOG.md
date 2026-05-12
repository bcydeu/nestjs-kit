# @yunhak/nestjs-kit

## 0.1.2

### Patch Changes

- fix(orm): `BaseEntity.id`에 `type: 'number'` 명시.

  tsup(esbuild) 번들 후 reflect-metadata가 사라져 MikroORM discovery 시점에 "Please provide either 'type' or 'entity' attribute in BaseEntity.id" 에러가 발생하던 문제 수정. 다른 필드들(createdAt/updatedAt/deletedAt)은 이미 `type` 명시되어 있어 영향 없음.

## 0.1.1

### Patch Changes

- 품질 정비 및 테스트 보강 (런타임 동작 변경 없음).
  - strict 풀세트 + ESLint/Prettier/husky + CI 강화
  - `AppException` 계약 테스트 5케이스 추가 (uiMessage/systemMessage/status 보존, getResponse 계약, response writable=false 등)

## 0.1.0

### Minor Changes

- 첫 공개 릴리즈 0.1.0.

  ### 서브패스 구성
  - `/common` — validators, filters, interceptors, errors, decorators, pipes, utils
  - `/security` — JwtUserGuard, JwtUserStrategy, PublicApi, SecurityModule.forRootAsync, throttleAsyncOptions
  - `/config` — JWT/ORM/Sentry/Throttle/Resend options + createConfigValidator 제네릭 팩토리
  - `/email` — EmailModule.forRootAsync, Resend 전략 (resend optional peer)
  - `/logging` — SentryLoggerModule, lazy Sentry loader (@sentry/nestjs optional peer)
  - `/orm` — BaseEntity, getRootAsyncOptions
  - `/orm/pool` — DB Pool 모니터링 (@willsoto/nestjs-prometheus optional peer)

  ### 주요 결정
  - tsup 기반 dual CJS/ESM + d.ts 빌드
  - 데코레이터 메타데이터 보존 검증 완료 (class-validator + class-transformer)
  - 런타임 의존성 0개 (전부 peerDependencies)
  - optional peers는 lazy require로 격리 (Sentry, Prometheus, Resend)
  - 26 test suites / 95 tests
