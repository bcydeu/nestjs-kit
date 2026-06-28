import { DynamicModule, Module, Provider } from '@nestjs/common';
import { createUseClassProvider } from '../common';
import { ResendEmailStrategy } from './strategy/resend-email.strategy';
import { loadResend } from './resend.loader';
import {
  EMAIL_CLIENT,
  RESEND_CLIENT,
  RESEND_STRATEGY_OPTIONS,
  ResendStrategyOptions,
} from './email.tokens';

export interface EmailModuleAsyncOptions {
  imports?: DynamicModule['imports'];
  inject?: unknown[];
  useFactory: (...args: unknown[]) => ResendStrategyOptions | Promise<ResendStrategyOptions>;
}

@Module({})
export class EmailModule {
  static forRootAsync(opts: EmailModuleAsyncOptions): DynamicModule {
    const optionsProvider: Provider = {
      provide: RESEND_STRATEGY_OPTIONS,
      inject: opts.inject as never,
      useFactory: opts.useFactory as never,
    };

    // resend 클라이언트 생성(= optional peer require)을 여기로 모은다.
    // strategy는 이 인스턴스를 주입받기만 하므로 테스트에서 stub 주입이 쉬워진다.
    const resendClientProvider: Provider = {
      provide: RESEND_CLIENT,
      inject: [RESEND_STRATEGY_OPTIONS],
      useFactory: (options: ResendStrategyOptions) => {
        const Resend = loadResend();
        return new Resend(options.apiKey);
      },
    };

    return {
      module: EmailModule,
      global: true,
      imports: opts.imports,
      providers: [
        optionsProvider,
        resendClientProvider,
        createUseClassProvider(EMAIL_CLIENT, ResendEmailStrategy),
      ],
      exports: [EMAIL_CLIENT],
    };
  }
}
