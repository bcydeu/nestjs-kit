---
'@yunhak/nestjs-kit': minor
---

로깅을 pino 기반 구조화 로깅으로 전환

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
