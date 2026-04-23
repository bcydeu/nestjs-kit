describe('loadSentry', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('@sentry/nestjs가 설치되어 있으면 실제 모듈을 반환한다', () => {
    jest.doMock('@sentry/nestjs', () => ({
      addBreadcrumb: jest.fn(),
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { loadSentry } = require('../sentry.loader');

    const sentry = loadSentry();

    expect(typeof sentry.addBreadcrumb).toBe('function');
    expect(sentry.logger).toBeDefined();
  });

  it('@sentry/nestjs 미설치 시 no-op SentryLike를 반환한다', () => {
    jest.doMock('@sentry/nestjs', () => {
      throw new Error('Cannot find module @sentry/nestjs');
    });

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { loadSentry } = require('../sentry.loader');

    const sentry = loadSentry();

    expect(typeof sentry.addBreadcrumb).toBe('function');
    // no-op이므로 호출해도 에러 없음, 반환값은 undefined
    expect(sentry.addBreadcrumb({ message: 'x' })).toBeUndefined();
    // logger는 no-op fallback에선 undefined
    expect(sentry.logger).toBeUndefined();
  });

  it('한 번 로드되면 같은 인스턴스를 캐시한다', () => {
    jest.doMock('@sentry/nestjs', () => ({
      addBreadcrumb: jest.fn(),
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { loadSentry } = require('../sentry.loader');

    const first = loadSentry();
    const second = loadSentry();

    expect(first).toBe(second);
  });
});
