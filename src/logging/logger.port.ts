import { Inject } from '@nestjs/common';

export type LogFields = Record<string, unknown>;

// service가 의존하는 로깅 추상. 구현(PinoAppLogger)을 교체해도 이 계약만 지키면 된다.
// 시그니처는 사람이 읽기 편하게 (message, meta) 순서로 고정한다(pino 원본은 반대).
export interface AppLogger {
  info(message: string, meta?: LogFields): void;
  warn(message: string, meta?: LogFields): void;
  /** 에러는 meta에 { err }로 넘기면 스택까지 직렬화된다. */
  error(message: string, meta?: LogFields): void;
  /** 이 로거에 고정으로 붙는 context(보통 클래스명)를 설정한다. */
  setContext(context: string): void;
  /**
   * 현재 "요청"의 이후 모든 로그에 필드를 병합한다(요청별 async context에 저장).
   * 어느 서비스에서 호출하든 같은 요청이면 이후 로그 전체에 반영된다.
   * 요청 스코프 밖(크론/큐/부트스트랩 등)에서 호출하면 throw한다.
   */
  assign(fields: LogFields): void;
}

// EmailModule의 EMAIL_CLIENT와 동일한 port/adapter 패턴. 소비처는 이 토큰으로 주입받는다.
export const APP_LOGGER = Symbol('APP_LOGGER');

/** `@Inject(APP_LOGGER)` 축약. `constructor(@InjectAppLogger() private logger: AppLogger)`. */
export const InjectAppLogger = () => Inject(APP_LOGGER);
