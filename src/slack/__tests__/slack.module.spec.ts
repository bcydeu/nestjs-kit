import { Test, TestingModule } from '@nestjs/testing';
import { SlackModule } from '../slack.module';
import { SLACK_CLIENT, SLACK_WEBHOOK_OPTIONS, SlackWebhookOptions } from '../slack.tokens';
import { SlackWebhookStrategy } from '../strategy/slack-webhook.strategy';

describe('SlackModule.forRootAsync', () => {
  it('DynamicModule을 global로 반환한다', () => {
    const mod = SlackModule.forRootAsync({
      useFactory: () => ({ webhookUrl: 'https://hooks.slack.com/services/x' }),
    });

    expect(mod.module).toBe(SlackModule);
    expect(mod.global).toBe(true);
    expect(mod.exports).toEqual([SLACK_CLIENT]);
  });

  it('SLACK_CLIENT 토큰으로 SlackWebhookStrategy 인스턴스를 제공한다', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SlackModule.forRootAsync({
          useFactory: (): SlackWebhookOptions => ({
            webhookUrl: 'https://hooks.slack.com/services/x',
          }),
        }),
      ],
    }).compile();

    const client = module.get(SLACK_CLIENT);
    expect(client).toBeInstanceOf(SlackWebhookStrategy);
    expect(typeof (client as SlackWebhookStrategy).send).toBe('function');

    await module.close();
  });

  it('factory 결과가 SLACK_WEBHOOK_OPTIONS로 주입된다', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SlackModule.forRootAsync({
          useFactory: () => ({
            webhookUrl: 'https://hooks.slack.com/services/injected',
            username: 'ci-bot',
          }),
        }),
      ],
    }).compile();

    const options = module.get<SlackWebhookOptions>(SLACK_WEBHOOK_OPTIONS);
    expect(options).toEqual({
      webhookUrl: 'https://hooks.slack.com/services/injected',
      username: 'ci-bot',
    });

    await module.close();
  });

  it('inject/imports가 DynamicModule에 그대로 전파된다', () => {
    const SOURCE = Symbol('SOURCE');
    const mod = SlackModule.forRootAsync({
      inject: [SOURCE],
      imports: [] as never,
      useFactory: () => ({ webhookUrl: 'https://hooks.slack.com/services/x' }),
    });

    const optionsProvider = (mod.providers ?? []).find(
      (p) =>
        typeof p === 'object' &&
        p !== null &&
        'provide' in p &&
        (p as { provide: unknown }).provide === SLACK_WEBHOOK_OPTIONS,
    ) as { provide: unknown; inject?: unknown[] } | undefined;

    expect(optionsProvider).toBeDefined();
    expect(optionsProvider?.inject).toEqual([SOURCE]);
  });
});
