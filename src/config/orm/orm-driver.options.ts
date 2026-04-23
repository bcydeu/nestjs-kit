import { NestedValidator, NumberValidator } from '../../common';

export class OrmDriverConnectionOptions {
  // 하나의 쿼리가 실행될 수 있는 최대 시간
  @NumberValidator({ positive: true })
  statementTimeout: number;
}

export class OrmDriverOptions {
  @NestedValidator({ type: () => OrmDriverConnectionOptions })
  connection: OrmDriverConnectionOptions;
}
