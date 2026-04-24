# @yunhak/nestjs-kit

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
