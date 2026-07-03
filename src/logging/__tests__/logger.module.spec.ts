import { Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Logger, PinoLogger } from 'nestjs-pino';
import { KitLoggerModule } from '../logger.module';
import { APP_LOGGER, AppLogger, InjectAppLogger } from '../logger.port';
import { PinoAppLogger } from '../pino-app-logger';

describe('KitLoggerModule', () => {
  describe('forRoot', () => {
    it('global DynamicModule을 반환하고 nestjs-pino 모듈 + APP_LOGGER를 노출한다', () => {
      const mod = KitLoggerModule.forRoot();
      expect(mod.module).toBe(KitLoggerModule);
      expect(mod.global).toBe(true);
      expect(mod.imports).toHaveLength(1);
      expect(mod.exports).toContain(APP_LOGGER);
    });

    it('nestjs-pino의 Logger(싱글톤)를 앱 전역에서 주입 가능하게 노출한다', async () => {
      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [KitLoggerModule.forRoot({ isProduction: () => true })],
      }).compile();

      expect(moduleRef.get(Logger, { strict: false })).toBeInstanceOf(Logger);
      // PinoLogger는 TRANSIENT라 resolve로 가져온다.
      expect(await moduleRef.resolve(PinoLogger)).toBeInstanceOf(PinoLogger);

      await moduleRef.close();
    });

    it('APP_LOGGER 토큰이 PinoAppLogger(TRANSIENT)로 바인딩된다', async () => {
      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [KitLoggerModule.forRoot({ isProduction: () => true })],
      }).compile();

      const logger = await moduleRef.resolve<AppLogger>(APP_LOGGER);
      expect(logger).toBeInstanceOf(PinoAppLogger);
      // 요청 밖에서도 info는 root 로거로 안전하게 위임된다(throw 없음).
      expect(() => logger.info('부팅 로그', { phase: 'init' })).not.toThrow();

      await moduleRef.close();
    });

    it('@InjectAppLogger()로 소비처 service에 주입된다', async () => {
      @Injectable()
      class OrderService {
        constructor(@InjectAppLogger() readonly logger: AppLogger) {
          this.logger.setContext(OrderService.name);
        }
      }

      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [KitLoggerModule.forRoot({ isProduction: () => true })],
        providers: [OrderService],
      }).compile();

      const service = await moduleRef.resolve(OrderService);
      expect(service.logger).toBeInstanceOf(PinoAppLogger);

      await moduleRef.close();
    });
  });

  describe('forRootAsync', () => {
    it('useFactory 옵션으로 구성되고 Logger와 APP_LOGGER를 노출한다', async () => {
      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [
          KitLoggerModule.forRootAsync({
            useFactory: () => ({ level: 'warn', isProduction: () => true }),
          }),
        ],
      }).compile();

      expect(moduleRef.get(Logger, { strict: false })).toBeInstanceOf(Logger);
      expect(await moduleRef.resolve<AppLogger>(APP_LOGGER)).toBeInstanceOf(PinoAppLogger);

      await moduleRef.close();
    });
  });
});
