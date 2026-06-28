import { Test, TestingModule } from '@nestjs/testing';
import { ConsoleLogger } from '@nestjs/common';
import { SentryLoggerService } from '../sentry-logger.service';
import { SENTRY_CLIENT } from '../sentry-logger.tokens';

// service는 sentry 클라이언트를 주입받으므로 stub 객체만 넣으면 된다.
const sentryMock = {
  addBreadcrumb: vi.fn(),
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
};

describe('SentryLoggerService', () => {
  let service: SentryLoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SentryLoggerService, { provide: SENTRY_CLIENT, useValue: sentryMock }],
    }).compile();

    service = await module.resolve<SentryLoggerService>(SentryLoggerService);

    vi.spyOn(ConsoleLogger.prototype, 'log').mockImplementation(() => {});
    vi.spyOn(ConsoleLogger.prototype, 'error').mockImplementation(() => {});
    vi.spyOn(ConsoleLogger.prototype, 'warn').mockImplementation(() => {});
    vi.clearAllMocks();
  });

  describe('Development', () => {
    beforeAll(() => {
      process.env.NODE_ENV = 'development';
    });

    it('개발환경에서는 Sentry로 전송하지 않는다', () => {
      service.log('Test Log', 'TestContext');
      expect(sentryMock.addBreadcrumb).not.toHaveBeenCalled();
    });

    it('개발환경에서는 error도 Sentry로 전송하지 않는다', () => {
      service.error('Test Error', 'stack', 'TestContext');
      expect(sentryMock.addBreadcrumb).not.toHaveBeenCalled();
    });
  });

  describe('Production', () => {
    beforeAll(() => {
      process.env.NODE_ENV = 'production';
    });

    it('error 발생 시 breadcrumb을 남긴다', () => {
      service.error('Critical Failure', 'stack trace', 'OrderService');

      expect(sentryMock.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'error',
          message: 'Critical Failure',
          level: 'error',
        }),
      );
    });

    it('HealthController 컨텍스트 로그는 필터링된다', () => {
      service.log('Health Check OK', 'HealthController');
      expect(sentryMock.addBreadcrumb).not.toHaveBeenCalled();
    });

    it('/health URL을 포함한 로그는 필터링된다', () => {
      service.log('GET /health 200 OK', 'HTTP');
      expect(sentryMock.addBreadcrumb).not.toHaveBeenCalled();
    });
  });
});
