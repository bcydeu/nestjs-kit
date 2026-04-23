import { DynamicModule, Module } from '@nestjs/common';
import { SentryLoggerService } from './sentry-logger.service';
import {
  SENTRY_LOGGER_OPTIONS,
  SentryLoggerOptions,
} from './sentry-logger.tokens';

@Module({
  providers: [SentryLoggerService],
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
        SentryLoggerService,
      ],
      exports: [SentryLoggerService],
    };
  }
}
