import { DynamicModule, Module, Provider } from '@nestjs/common';
import { buildPinoParams } from './logger.defaults';
import { loadNestjsPino } from './pino.loader';
import { APP_LOGGER } from './logger.port';
import { PinoAppLogger } from './pino-app-logger';
import type { KitLoggerAsyncOptions, KitLoggerOptions } from './logger.type';

// AppLogger port를 APP_LOGGER 토큰에 PinoAppLogger로 바인딩(= EmailModule의 EMAIL_CLIENT 패턴).
// 스코프(TRANSIENT)는 PinoAppLogger 클래스의 @Injectable 메타에서 상속된다.
const appLoggerProvider: Provider = { provide: APP_LOGGER, useClass: PinoAppLogger };

// nestjs-pino를 감싸 kit 기본값(구조화 JSON, 민감정보 redact, 요청 컨텍스트,
// dev pretty)을 입혀 제공하는 로거 모듈.
//
// 소비처 사용법:
//   AppModule에 `KitLoggerModule.forRoot()` import 후, main.ts에서
//   `import { Logger } from 'nestjs-pino'; app.useLogger(app.get(Logger));`
//   로 앱 로거로 지정한다. service에서는 `@InjectAppLogger() logger: AppLogger`로 주입.
//   예외/스택트레이스의 Sentry 전송은 로거가 아니라
//   AllCatchExceptionFilter(@SentryExceptionCaptured)가 담당한다.
@Module({})
export class KitLoggerModule {
  static forRoot(options: KitLoggerOptions = {}): DynamicModule {
    const { LoggerModule } = loadNestjsPino();
    const inner = LoggerModule.forRoot(buildPinoParams(options));
    return {
      module: KitLoggerModule,
      global: true,
      imports: [inner],
      providers: [appLoggerProvider],
      // 내부 nestjs-pino 모듈(Logger/PinoLogger)과 AppLogger 토큰을 앱 전역에 재노출한다.
      exports: [inner, APP_LOGGER],
    };
  }

  static forRootAsync(options: KitLoggerAsyncOptions): DynamicModule {
    const { LoggerModule } = loadNestjsPino();
    const inner = LoggerModule.forRootAsync({
      imports: options.imports,
      inject: options.inject,
      useFactory: async (...args: unknown[]) => buildPinoParams(await options.useFactory(...args)),
    });
    return {
      module: KitLoggerModule,
      global: true,
      imports: [inner],
      providers: [appLoggerProvider],
      exports: [inner, APP_LOGGER],
    };
  }
}
