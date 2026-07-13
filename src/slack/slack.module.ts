import { DynamicModule, Module, Provider } from '@nestjs/common';
import { createUseClassProvider } from '../common';
import { SlackWebhookStrategy } from './strategy/slack-webhook.strategy';
import { createFetchSlackClient } from './slack.client';
import {
  SLACK_CLIENT,
  SLACK_HTTP_CLIENT,
  SLACK_WEBHOOK_OPTIONS,
  SlackWebhookOptions,
} from './slack.tokens';

export interface SlackModuleAsyncOptions {
  imports?: DynamicModule['imports'];
  inject?: unknown[];
  useFactory: (...args: unknown[]) => SlackWebhookOptions | Promise<SlackWebhookOptions>;
}

@Module({})
export class SlackModule {
  static forRootAsync(opts: SlackModuleAsyncOptions): DynamicModule {
    const optionsProvider: Provider = {
      provide: SLACK_WEBHOOK_OPTIONS,
      inject: opts.inject as never,
      useFactory: opts.useFactory as never,
    };

    // fetch 참조(= slack.client)를 여기로 모은다. strategy는 이 인스턴스를
    // 주입받기만 하므로 테스트에서 stub 주입이 쉬워진다.
    const httpClientProvider: Provider = {
      provide: SLACK_HTTP_CLIENT,
      useFactory: () => createFetchSlackClient(),
    };

    return {
      module: SlackModule,
      global: true,
      imports: opts.imports,
      providers: [
        optionsProvider,
        httpClientProvider,
        createUseClassProvider(SLACK_CLIENT, SlackWebhookStrategy),
      ],
      exports: [SLACK_CLIENT],
    };
  }
}
