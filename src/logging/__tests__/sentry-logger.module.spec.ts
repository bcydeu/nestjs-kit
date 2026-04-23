import { Test, TestingModule } from '@nestjs/testing';
import { SentryLoggerModule } from '../sentry-logger.module';
import { SentryLoggerService } from '../sentry-logger.service';
import {
  SENTRY_LOGGER_OPTIONS,
  SentryLoggerOptions,
} from '../sentry-logger.tokens';

describe('SentryLoggerModule', () => {
  describe('정적 import (forRoot 없이)', () => {
    it('SentryLoggerService를 제공한다', async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [SentryLoggerModule],
      }).compile();

      const service = await module.resolve(SentryLoggerService);
      expect(service).toBeInstanceOf(SentryLoggerService);

      await module.close();
    });
  });

  describe('forRoot', () => {
    it('DynamicModule을 global로 반환한다', () => {
      const mod = SentryLoggerModule.forRoot();

      expect(mod.module).toBe(SentryLoggerModule);
      expect(mod.global).toBe(true);
      expect(mod.exports).toEqual([SentryLoggerService]);
    });

    it('options가 SENTRY_LOGGER_OPTIONS 토큰으로 주입된다', async () => {
      const customOpts: SentryLoggerOptions = {
        ignoredContexts: ['MyNoise'],
        isProduction: () => true,
      };

      const module: TestingModule = await Test.createTestingModule({
        imports: [SentryLoggerModule.forRoot(customOpts)],
      }).compile();

      const injected = module.get<SentryLoggerOptions>(SENTRY_LOGGER_OPTIONS);
      expect(injected.ignoredContexts).toEqual(['MyNoise']);
      expect(injected.isProduction?.()).toBe(true);

      await module.close();
    });

    it('빈 options도 허용 — SentryLoggerService가 기본값을 사용한다', async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [SentryLoggerModule.forRoot()],
      }).compile();

      const service = await module.resolve(SentryLoggerService);
      expect(service).toBeInstanceOf(SentryLoggerService);

      await module.close();
    });
  });
});
