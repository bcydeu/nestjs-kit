import { DynamicModule, Module, Provider } from '@nestjs/common';
import { SentryLoggerService } from './sentry-logger.service';
import { loadSentry } from './sentry.loader';
import { SENTRY_CLIENT, SENTRY_LOGGER_OPTIONS, SentryLoggerOptions } from './sentry-logger.tokens';

// sentry 클라이언트 로드(= optional peer require)를 모듈로 모은다.
// service는 이 인스턴스를 주입받기만 하므로 테스트에서 stub 주입이 쉬워진다.
const sentryClientProvider: Provider = {
  provide: SENTRY_CLIENT,
  useFactory: () => loadSentry(),
};

@Module({
  providers: [sentryClientProvider, SentryLoggerService],
  exports: [SentryLoggerService],
})
export class SentryLoggerModule {
  /**
   * 옵션 없이 기본 동작만 쓸 경우 `SentryLoggerModule`을 그대로 import해도 된다.
   * `ignoredContexts` 커스터마이즈가 필요하면 `forRoot`를 사용.
   */
  static forRoot(options: SentryLoggerOptions = {}): DynamicModule {
    return {
      module: SentryLoggerModule,
      global: true,
      providers: [
        { provide: SENTRY_LOGGER_OPTIONS, useValue: options },
        sentryClientProvider,
        SentryLoggerService,
      ],
      exports: [SentryLoggerService],
    };
  }
}
