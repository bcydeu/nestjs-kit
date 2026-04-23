import { Test, TestingModule } from '@nestjs/testing';
import { ConsoleLogger } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { SentryLoggerService } from '../sentry-logger.service';

jest.mock('@sentry/nestjs', () => ({
  addBreadcrumb: jest.fn(),
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('SentryLoggerService', () => {
  let service: SentryLoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SentryLoggerService],
    }).compile();

    service = await module.resolve<SentryLoggerService>(SentryLoggerService);

    jest.spyOn(ConsoleLogger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(ConsoleLogger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(ConsoleLogger.prototype, 'warn').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  describe('Development', () => {
    beforeAll(() => {
      process.env.NODE_ENV = 'development';
    });

    it('개발환경에서는 Sentry로 전송하지 않는다', () => {
      service.log('Test Log', 'TestContext');
      expect(Sentry.addBreadcrumb).not.toHaveBeenCalled();
    });

    it('개발환경에서는 error도 Sentry로 전송하지 않는다', () => {
      service.error('Test Error', 'stack', 'TestContext');
      expect(Sentry.addBreadcrumb).not.toHaveBeenCalled();
    });
  });

  describe('Production', () => {
    beforeAll(() => {
      process.env.NODE_ENV = 'production';
    });

    it('error 발생 시 breadcrumb을 남긴다', () => {
      service.error('Critical Failure', 'stack trace', 'OrderService');

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'error',
          message: 'Critical Failure',
          level: 'error',
        }),
      );
    });

    it('HealthController 컨텍스트 로그는 필터링된다', () => {
      service.log('Health Check OK', 'HealthController');
      expect(Sentry.addBreadcrumb).not.toHaveBeenCalled();
    });

    it('/health URL을 포함한 로그는 필터링된다', () => {
      service.log('GET /health 200 OK', 'HTTP');
      expect(Sentry.addBreadcrumb).not.toHaveBeenCalled();
    });
  });
});
