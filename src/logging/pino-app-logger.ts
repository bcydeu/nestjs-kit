import { Injectable, Scope } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import type { AppLogger, LogFields } from './logger.port';

// 기본 AppLogger 구현. pino를 다른 로거로 교체하려면 이 어댑터만 갈아끼우면 된다.
//
// TRANSIENT인 이유: 주입하는 클래스마다 자기 context(setContext) 라벨을 갖게 하기 위함.
// (nestjs-pino PinoLogger 자체가 같은 이유로 TRANSIENT다.)
// 주의: REQUEST scope가 아니므로 요청마다 재생성되지 않고 소비자를 오염시키지도 않는다.
// req.id 상관관계와 assign()은 PinoLogger가 호출 시점에 AsyncLocalStorage에서
// 요청 로거를 꺼내오므로 인스턴스 scope와 무관하게 동작한다.
@Injectable({ scope: Scope.TRANSIENT })
export class PinoAppLogger implements AppLogger {
  constructor(private readonly pino: PinoLogger) {}

  info(message: string, meta?: LogFields): void {
    this.pino.info(meta ?? {}, message);
  }

  warn(message: string, meta?: LogFields): void {
    this.pino.warn(meta ?? {}, message);
  }

  error(message: string, meta?: LogFields): void {
    this.pino.error(meta ?? {}, message);
  }

  setContext(context: string): void {
    this.pino.setContext(context);
  }

  assign(fields: LogFields): void {
    this.pino.assign(fields);
  }
}
