import type { ThrottlerAsyncOptions } from '@nestjs/throttler';

export interface ThrottleFactoryValue {
  ttl: number;
  limit: number;
}

export interface ThrottleAsyncOptionsInput {
  imports?: ThrottlerAsyncOptions['imports'];
  inject?: ThrottlerAsyncOptions['inject'];
  useFactory: (
    ...args: unknown[]
  ) => ThrottleFactoryValue | Promise<ThrottleFactoryValue>;
}

/**
 * `ThrottlerModule.forRootAsync(throttleAsyncOptions({ ... }))` 형태로 사용.
 *
 * kit은 Throttler를 SecurityModule에서 분리했다. 소비처에서 필요할 때만
 * `@nestjs/throttler`를 설치해 직접 등록하고, 이 헬퍼는 factory 시그니처를
 * 단순화해주는 얇은 어댑터 역할만 한다.
 */
export function throttleAsyncOptions(
  opts: ThrottleAsyncOptionsInput,
): ThrottlerAsyncOptions {
  return {
    imports: opts.imports,
    inject: opts.inject,
    useFactory: async (...args) => {
      const { ttl, limit } = await opts.useFactory(...args);
      return { throttlers: [{ ttl, limit }] };
    },
  };
}
