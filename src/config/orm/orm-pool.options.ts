import { NumberValidator } from '../../common';

export class OrmPoolOptions {
  @NumberValidator({ min: 1 })
  min: number;

  @NumberValidator({ max: 20 })
  max: number;

  // 유휴 연결 해제 시간
  @NumberValidator({ positive: true })
  idleTimeoutMillis: number;

  // 커넥션 하나 기다리는 최대 시간
  @NumberValidator({ positive: true })
  acquireTimeoutMillis: number;
}
