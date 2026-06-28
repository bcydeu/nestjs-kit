describe('loadSentry', () => {
  beforeEach(() => {
    // 모듈 캐시(loadSentry 내부 cached)를 초기화해 각 테스트가 독립적으로 로드되게 한다.
    vi.resetModules();
  });

  it('@sentry/nestjs가 설치되어 있으면 실제 모듈을 반환한다', async () => {
    const { loadSentry } = await import('../sentry.loader');

    const sentry = loadSentry(() => ({
      addBreadcrumb: vi.fn(),
      logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    }));

    expect(typeof sentry.addBreadcrumb).toBe('function');
    expect(sentry.logger).toBeDefined();
  });

  it('@sentry/nestjs 미설치 시 no-op SentryLike를 반환한다', async () => {
    const { loadSentry } = await import('../sentry.loader');

    const sentry = loadSentry(() => {
      throw new Error('Cannot find module @sentry/nestjs');
    });

    expect(typeof sentry.addBreadcrumb).toBe('function');
    // no-op이므로 호출해도 에러 없음, 반환값은 undefined
    expect(sentry.addBreadcrumb({ message: 'x' })).toBeUndefined();
    // logger는 no-op fallback에선 undefined
    expect(sentry.logger).toBeUndefined();
  });

  it('한 번 로드되면 같은 인스턴스를 캐시한다', async () => {
    const { loadSentry } = await import('../sentry.loader');

    const first = loadSentry(() => ({ addBreadcrumb: vi.fn() }));
    // 두 번째 인자는 무시되고 캐시된 첫 인스턴스를 반환해야 한다.
    const second = loadSentry(() => ({ addBreadcrumb: vi.fn() }));

    expect(first).toBe(second);
  });
});
