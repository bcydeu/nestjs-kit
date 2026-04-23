jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: jest.fn() },
    batch: { send: jest.fn() },
  })),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { EmailModule } from '../email.module';
import {
  EMAIL_CLIENT,
  RESEND_STRATEGY_OPTIONS,
  ResendStrategyOptions,
} from '../email.tokens';
import { ResendEmailStrategy } from '../strategy/resend-email.strategy';

describe('EmailModule.forRootAsync', () => {
  it('DynamicModule을 global로 반환한다', () => {
    const mod = EmailModule.forRootAsync({
      useFactory: () => ({ apiKey: 'k', from: 'f@example.com' }),
    });

    expect(mod.module).toBe(EmailModule);
    expect(mod.global).toBe(true);
    expect(mod.exports).toEqual([EMAIL_CLIENT]);
  });

  it('EMAIL_CLIENT 토큰으로 ResendEmailStrategy 인스턴스를 제공한다', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        EmailModule.forRootAsync({
          useFactory: (): ResendStrategyOptions => ({
            apiKey: 'test-key',
            from: 'from@example.com',
          }),
        }),
      ],
    }).compile();

    const client = module.get(EMAIL_CLIENT);
    expect(client).toBeInstanceOf(ResendEmailStrategy);
    expect(typeof (client as ResendEmailStrategy).send).toBe('function');
    expect(typeof (client as ResendEmailStrategy).sendBatch).toBe('function');

    await module.close();
  });

  it('factory 결과가 RESEND_STRATEGY_OPTIONS로 주입된다', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        EmailModule.forRootAsync({
          useFactory: () => ({
            apiKey: 'injected-key',
            from: 'injected@example.com',
          }),
        }),
      ],
    }).compile();

    const options = module.get<ResendStrategyOptions>(RESEND_STRATEGY_OPTIONS);
    expect(options).toEqual({
      apiKey: 'injected-key',
      from: 'injected@example.com',
    });

    await module.close();
  });

  it('inject/imports가 DynamicModule에 그대로 전파된다', () => {
    const SOURCE = Symbol('SOURCE');
    const mod = EmailModule.forRootAsync({
      inject: [SOURCE],
      imports: [] as never,
      useFactory: () => ({ apiKey: 'k', from: 'f@example.com' }),
    });

    // RESEND_STRATEGY_OPTIONS provider가 inject를 보유하는지 검사
    const optionsProvider = (mod.providers ?? []).find(
      p =>
        typeof p === 'object' &&
        p !== null &&
        'provide' in p &&
        (p as { provide: unknown }).provide === RESEND_STRATEGY_OPTIONS,
    ) as { provide: unknown; inject?: unknown[] } | undefined;

    expect(optionsProvider).toBeDefined();
    expect(optionsProvider?.inject).toEqual([SOURCE]);
  });
});
