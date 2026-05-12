# @yunhak/nestjs-kit

## 0.2.0

### Minor Changes

- BREAKING: 여러 가지 큰 변경.

  ### 1. `/orm/pool` 서브패스 제거

  prometheus 기반 DB 풀 모니터링 모듈(`PoolMonitorModule`, `PoolMonitorService`, `PoolMetricsService`)을 제거. setup이 복잡하고 유지보수 부담이 커서 라이브러리에서 제외. 사용 측에서 직접 구현하거나 `@willsoto/nestjs-prometheus` 등으로 자체 구성할 것.
  - `@yunhak/nestjs-kit/orm/pool` import 제거 필요
  - `@willsoto/nestjs-prometheus`, `prom-client` peer 의존성 제거
  - `OrmPoolOptions`(DB 연결풀 min/max 등)는 `mikro-orm.helper.ts`에서 계속 사용되므로 유지

  ### 2. 빌드 도구: tsup → tsc

  NestJS 생태계는 reflect-metadata 의존이 강한데, esbuild 기반 tsup은 `emitDecoratorMetadata`를 honor하지 않아 BaseEntity처럼 데코레이터 메타데이터에 의존하는 클래스에서 함정이 자주 발생. tsc로 전환해 metadata가 정상 emit되도록 함.
  - ESM(`.mjs`) 출력 제거 — CJS 단일 포맷. NestJS 앱은 거의 모두 CJS라 영향 미미.
  - `package.json#exports`의 `import` 필드 제거, `default`로 통일.
  - `tsup`, `tsup.config.ts` 제거. `tsconfig.build.json` 추가.

  ### 3. `CommonErrorMessages` 제거 — `UiMessages`로 통합

  Swagger 데코레이터(`ApiCommonErrorResponses`)와 런타임 응답 필터(`AllCatchExceptionFilter`)가 각각 다른 메시지 상수를 들고 있어 단일 진실원천 위반이었음. `CommonErrorMessages` 삭제하고 `UiMessages`만 사용하도록 통일. `UiMessages`에 `SERVICE_UNAVAILABLE` 추가.
  - `import { CommonErrorMessages } from '@yunhak/nestjs-kit/common'` → 사용 중이었다면 `UiMessages`로 대체

  ### 4. 도메인 메시지 제거 (`EMAIL_ALREADY_EXISTS`, `INVALID_CREDENTIALS`)

  라이브러리는 표준 HTTP 메시지만 제공. 도메인 메시지는 사용처 앱이 자체 enum으로 관리하는 게 자연스러워 제거.
  - `UiMessages.EMAIL_ALREADY_EXISTS`, `UiMessages.INVALID_CREDENTIALS` 참조하던 코드는 앱 측에 자체 메시지 enum을 정의해 사용

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
