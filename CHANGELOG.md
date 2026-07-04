# @yunhak/nestjs-kit

## 1.0.0

### Major Changes

- bf7649c: 로깅을 pino 기반 구조화 로깅으로 전환

  `./logging` 서브패스의 로깅 백본을 nestjs-pino 기반 `KitLoggerModule`로 교체했다. 일반 로그(info/warn/debug)는 pino가 구조화 JSON으로 stdout에 남기고, 예외/스택트레이스의 Sentry 전송은 로거가 아니라 기존 `AllCatchExceptionFilter`(`@SentryExceptionCaptured`)가 담당한다. 즉 로깅과 에러 추적의 책임을 분리했다.

  **BREAKING CHANGE**
  - `SentryLoggerModule`, `SentryLoggerService`, `SentryLoggerOptions`, `SentryLike`, `SENTRY_CLIENT`, `SENTRY_LOGGER_OPTIONS` 제거. 이들은 모든 로그를 Sentry로 포워딩했는데, 예외 캡쳐는 이미 예외 필터가 담당하므로 중복이었고 상시 로그 전송은 노이즈/비용 문제가 있었다.
  - 대체: `KitLoggerModule.forRoot()` / `forRootAsync()`. `nestjs-pino`·`pino`(선택적으로 `pino-pretty`)를 optional peer로 추가한다.

  **로깅 추상(AppLogger)**

  service는 pino에 직접 의존하지 않고 `AppLogger` port(`APP_LOGGER` 토큰)에 의존한다. 기본 구현은 `PinoAppLogger`(TRANSIENT)로, `PinoLogger`에 위임한다. EmailModule의 `EMAIL_CLIENT` port/adapter 패턴과 동일.

  ```ts
  constructor(@InjectAppLogger() private readonly logger: AppLogger) {
    this.logger.setContext(OrderService.name);
  }
  this.logger.info('주문 생성', { orderId });     // (message, meta) 순서
  this.logger.assign({ userId });                 // 이 요청의 이후 모든 로그에 병합
  ```

  `AppLogger` 메서드: `info` / `warn` / `error` / `setContext` / `assign`.

  **마이그레이션**

  ```ts
  // AppModule
  imports: [KitLoggerModule.forRoot()];

  // main.ts
  import { Logger } from 'nestjs-pino';
  app.useLogger(app.get(Logger));
  ```

  기본값: 구조화 JSON, 민감정보 redact(authorization/cookie/password 등), 요청 컨텍스트(`x-request-id` 존중·생성), `/health` 요청 로그 제외, dev 환경에서 `pino-pretty` 설치 시 컬러 출력.

## 0.3.1

### Patch Changes

- 8e4199b: fix(orm): `driverOptions`의 v6(knex)식 `connection` 중첩 제거 — v7(kysely) 호환.

  MikroORM v7은 `driverOptions`를 pg `Pool` 설정에 그대로 스프레드하는데, v6식으로
  `driverOptions.connection`을 중첩하면 pg가 `connection` 키를 주입된 Connection
  인스턴스로 오인해 첫 쿼리에서 `TypeError: con.connect is not a function`으로 터진다.
  `statement_timeout`을 `driverOptions` 최상위로 이동. 소비처 설정 DTO
  (`OrmDriverOptions.connection.statementTimeout`)는 그대로라 사용 측 변경 없음.

## 0.3.0

### Minor Changes

- 5362e46: MikroORM v6 → v7 마이그레이션 (BREAKING).

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

### Patch Changes

- 0b986c1: `AppException`의 `uiMessage` 파라미터를 `UiMessages | (string & {})`로 완화. 표준 `UiMessages` 9개의 자동완성 힌트는 유지하면서, 도메인 정의 문구도 `as UiMessages` 캐스트 없이 받을 수 있다. 입력 지점(`AppException`)만 넓히고 전역 필터·Swagger 데코레이터는 표준 9개에 의존하므로 그대로 둠.

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
