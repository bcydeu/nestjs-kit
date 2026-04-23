import { DynamicModule, Module, Provider } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { JwtUserStrategy } from './jwt-user.strategy';
import { JwtUserGuard } from './jwt-user.guard';
import { JWT_USER_OPTIONS, JwtUserOptions } from './security.tokens';

export interface SecurityModuleAsyncOptions {
  imports?: DynamicModule['imports'];
  inject?: unknown[];
  useFactory: (...args: unknown[]) => JwtUserOptions | Promise<JwtUserOptions>;
}

@Module({})
export class SecurityModule {
  static forRootAsync(opts: SecurityModuleAsyncOptions): DynamicModule {
    const optionsProvider: Provider = {
      provide: JWT_USER_OPTIONS,
      inject: opts.inject as never,
      useFactory: opts.useFactory as never,
    };

    return {
      module: SecurityModule,
      global: true,
      imports: [
        ...(opts.imports ?? []),
        JwtModule.registerAsync({
          global: true,
          imports: opts.imports,
          inject: opts.inject as never,
          useFactory: async (...args: unknown[]): Promise<JwtModuleOptions> => {
            const { secret, expiresIn } = await opts.useFactory(...args);
            return {
              secret,
              signOptions:
                expiresIn !== undefined
                  ? ({ expiresIn } as JwtModuleOptions['signOptions'])
                  : undefined,
            };
          },
        }),
      ],
      providers: [optionsProvider, JwtUserStrategy, JwtUserGuard],
      exports: [JwtUserStrategy, JwtUserGuard, JwtModule],
    };
  }
}
