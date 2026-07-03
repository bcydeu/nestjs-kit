import { loadNestjsPino, canResolvePinoPretty } from '../pino.loader';

describe('loadNestjsPino', () => {
  it('nestjs-pino가 설치돼 있으면 LoggerModule을 가진 모듈을 반환한다', () => {
    const stub = { LoggerModule: { forRoot: vi.fn(), forRootAsync: vi.fn() } };
    const mod = loadNestjsPino(() => stub);
    expect(mod.LoggerModule).toBe(stub.LoggerModule);
    expect(typeof mod.LoggerModule.forRoot).toBe('function');
  });

  it('미설치 시 설치 안내 에러를 던진다', () => {
    expect(() =>
      loadNestjsPino(() => {
        throw new Error('Cannot find module nestjs-pino');
      }),
    ).toThrow(/nestjs-pino/);
  });

  it('기본 require로도 로드된다(devDependency로 설치됨)', () => {
    const mod = loadNestjsPino();
    expect(mod.LoggerModule).toBeDefined();
    expect(typeof mod.LoggerModule.forRoot).toBe('function');
  });
});

describe('canResolvePinoPretty', () => {
  it('resolve 성공 시 true', () => {
    expect(canResolvePinoPretty(() => '/path/to/pino-pretty')).toBe(true);
  });

  it('resolve 실패 시 false', () => {
    expect(
      canResolvePinoPretty(() => {
        throw new Error('not found');
      }),
    ).toBe(false);
  });

  it('기본 resolver로 pino-pretty를 찾는다(devDependency)', () => {
    expect(canResolvePinoPretty()).toBe(true);
  });
});
