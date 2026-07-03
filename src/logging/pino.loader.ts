import type { DynamicModule } from '@nestjs/common';

// nestjs-pino는 optional peer. 다만 로그 백본이므로 미설치 시 no-op이 아니라
// 명확한 설치 안내 에러를 던진다(= resend.loader와 같은 정책, sentry.loader의
// no-op fallback과는 의도적으로 다르다). require 인자는 테스트 주입을 위해
// 노출한다(vitest는 native require 모킹을 지원하지 않으므로 함수 경계에서 주입).

export interface NestjsPinoModule {
  LoggerModule: {
    forRoot(params?: unknown): DynamicModule;
    forRootAsync(params: unknown): DynamicModule;
  };
}

export function loadNestjsPino(req: (id: string) => unknown = require): NestjsPinoModule {
  try {
    return req('nestjs-pino') as NestjsPinoModule;
  } catch {
    throw new Error(
      "KitLoggerModule을 사용하려면 optional peer 'nestjs-pino'와 'pino'가 필요합니다. " +
        '`npm install nestjs-pino pino` 후 다시 시도하세요.',
    );
  }
}

// pino-pretty(dev 전용 컬러 출력)도 optional. 설치돼 있을 때만 transport로 붙인다.
// 미설치인데 pretty를 켜면 pino가 부팅 시점에 죽으므로, 여기서 먼저 존재를 확인한다.
export function canResolvePinoPretty(resolve: (id: string) => string = require.resolve): boolean {
  try {
    resolve('pino-pretty');
    return true;
  } catch {
    return false;
  }
}
