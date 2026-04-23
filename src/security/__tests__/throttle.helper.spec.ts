import { throttleAsyncOptions } from '../throttle.helper';

describe('throttleAsyncOptions', () => {
  it('imports, inject, useFactory를 그대로 전달한다', () => {
    const factory = jest.fn().mockResolvedValue({ ttl: 60000, limit: 10 });
    const opts = throttleAsyncOptions({
      imports: [] as never,
      inject: ['TOKEN'],
      useFactory: factory,
    });

    expect(opts.imports).toEqual([]);
    expect(opts.inject).toEqual(['TOKEN']);
    expect(typeof opts.useFactory).toBe('function');
  });

  it('useFactory는 { ttl, limit } 를 { throttlers: [...] } 형태로 래핑한다', async () => {
    const opts = throttleAsyncOptions({
      useFactory: () => ({ ttl: 60000, limit: 10 }),
    });

    const wrapped = await (opts.useFactory as (...args: unknown[]) => Promise<any>)();

    expect(wrapped).toEqual({ throttlers: [{ ttl: 60000, limit: 10 }] });
  });

  it('비동기 factory도 지원한다', async () => {
    const opts = throttleAsyncOptions({
      useFactory: async () => ({ ttl: 1000, limit: 5 }),
    });

    const wrapped = await (opts.useFactory as (...args: unknown[]) => Promise<any>)();

    expect(wrapped.throttlers[0]).toEqual({ ttl: 1000, limit: 5 });
  });

  it('factory에 주입된 인자들이 그대로 전달된다', async () => {
    const factory = jest.fn().mockResolvedValue({ ttl: 1, limit: 1 });
    const opts = throttleAsyncOptions({ useFactory: factory });

    await (opts.useFactory as (...args: unknown[]) => Promise<any>)('a', 'b', 3);

    expect(factory).toHaveBeenCalledWith('a', 'b', 3);
  });
});
