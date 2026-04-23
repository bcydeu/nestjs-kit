import { DynamicModule, Module, Provider } from '@nestjs/common';
import { createUseClassProvider } from '../common';
import { ResendEmailStrategy } from './strategy/resend-email.strategy';
import {
  EMAIL_CLIENT,
  RESEND_STRATEGY_OPTIONS,
  ResendStrategyOptions,
} from './email.tokens';

export interface EmailModuleAsyncOptions {
  imports?: DynamicModule['imports'];
  inject?: unknown[];
  useFactory: (
    ...args: unknown[]
  ) => ResendStrategyOptions | Promise<ResendStrategyOptions>;
}

@Module({})
export class EmailModule {
  static forRootAsync(opts: EmailModuleAsyncOptions): DynamicModule {
    const optionsProvider: Provider = {
      provide: RESEND_STRATEGY_OPTIONS,
      inject: opts.inject as never,
      useFactory: opts.useFactory as never,
    };

    return {
      module: EmailModule,
      global: true,
      imports: opts.imports,
      providers: [
        optionsProvider,
        createUseClassProvider(EMAIL_CLIENT, ResendEmailStrategy),
      ],
      exports: [EMAIL_CLIENT],
    };
  }
}
