import { ConfigService } from '@nestjs/config';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { getRootAsyncOptions } from '../mikro-orm.helper';
import { OrmOptions } from '../../config';

describe('getRootAsyncOptions', () => {
  it('PostgreSqlDriver를 사용하는 MikroOrmModuleAsyncOptions를 반환한다', () => {
    const options = getRootAsyncOptions();

    expect(options.driver).toBe(PostgreSqlDriver);
    expect(options.inject).toEqual([ConfigService]);
    expect(typeof options.useFactory).toBe('function');
  });

  it('factory는 ConfigService로부터 db 네임스페이스를 꺼내 autoLoadEntities를 덧붙인다', () => {
    const ormOptions: OrmOptions = {
      dbName: 'testdb',
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'postgres',
      driverOptions: { connection: { statementTimeout: 10000 } },
      pool: {
        min: 2,
        max: 10,
        idleTimeoutMillis: 5000,
        acquireTimeoutMillis: 10000,
      },
    };

    const configService = {
      getOrThrow: jest.fn().mockReturnValue(ormOptions),
    } as unknown as ConfigService;

    const options = getRootAsyncOptions();
    const useFactory = options.useFactory as (c: ConfigService) => any;

    const result = useFactory(configService);

    expect(configService.getOrThrow).toHaveBeenCalledWith('db');
    expect(result.autoLoadEntities).toBe(true);
    expect(result.dbName).toBe('testdb');
    expect(result.host).toBe('localhost');
    expect(result.pool).toMatchObject({ min: 2, max: 10 });
  });

  it('driverOptions.connection.statement_timeout으로 env 키를 snake_case 매핑한다', () => {
    const ormOptions: OrmOptions = {
      dbName: 'd',
      host: 'h',
      port: 1,
      user: 'u',
      password: 'p',
      driverOptions: { connection: { statementTimeout: 42 } },
      pool: { min: 1, max: 2, idleTimeoutMillis: 3, acquireTimeoutMillis: 4 },
    };
    const configService = {
      getOrThrow: jest.fn().mockReturnValue(ormOptions),
    } as unknown as ConfigService;

    const result = (
      getRootAsyncOptions().useFactory as (c: ConfigService) => any
    )(configService);

    expect(result.driverOptions.connection.statement_timeout).toBe(42);
  });

  it('NODE_ENV=production이면 debug=false', () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const configService = {
      getOrThrow: jest.fn().mockReturnValue({
        dbName: 'd',
        host: 'h',
        port: 1,
        user: 'u',
        password: 'p',
        driverOptions: { connection: { statementTimeout: 1 } },
        pool: { min: 1, max: 2, idleTimeoutMillis: 3, acquireTimeoutMillis: 4 },
      }),
    } as unknown as ConfigService;

    const result = (
      getRootAsyncOptions().useFactory as (c: ConfigService) => any
    )(configService);

    expect(result.debug).toBe(false);

    process.env.NODE_ENV = original;
  });
});
