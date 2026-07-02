import { defineConfig, PostgreSqlDriver, UnderscoreNamingStrategy } from '@mikro-orm/postgresql';
import { ConfigService } from '@nestjs/config';
import { MikroOrmModuleAsyncOptions } from '@mikro-orm/nestjs';
import { Environment } from '../common';
import { OrmOptions } from '../config';

/**
 * `MikroOrmModule.forRootAsync(getRootAsyncOptions())` 형태로 사용.
 *
 * 소비처의 ConfigService에서 `db` 네임스페이스로 `OrmOptions`를 꺼내 설정을 조립하고,
 * `autoLoadEntities: true`로 각 Feature 모듈이 등록한 엔티티를 자동 수집한다.
 *
 * CLI용 `getCliOrmConfig` (엔티티 glob, migrations/seeder 경로 등)는
 * 프로젝트마다 달라서 템플릿의 `mikro-orm.config.ts`에서 별도 정의해야 한다.
 */
export const getRootAsyncOptions = (): MikroOrmModuleAsyncOptions => ({
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const configs = getAppOrmConfig(configService);
    return { ...configs, autoLoadEntities: true };
  },
  driver: PostgreSqlDriver,
});

const getAppOrmConfig = (config: ConfigService) => {
  const { dbName, host, port, user, password, driverOptions, pool } =
    config.getOrThrow<OrmOptions>('db');

  return defineConfig({
    autoJoinOneToOneOwner: false,
    autoJoinRefsForFilters: false,
    validateRequired: true,
    forceUtcTimezone: false,
    forceUndefined: false,
    ignoreUndefinedInQuery: true,
    namingStrategy: UnderscoreNamingStrategy,
    dbName,
    host,
    port,
    user,
    password,
    debug: process.env.NODE_ENV === Environment.PRODUCTION ? false : true,
    // v7(kysely)은 driverOptions를 pg Pool 설정에 그대로 스프레드한다.
    // v6(knex)식 connection 중첩을 쓰면 pg가 `connection` 키를 Connection
    // 인스턴스로 오인해 "con.connect is not a function"으로 터진다.
    driverOptions: {
      statement_timeout: driverOptions.connection.statementTimeout,
    },
    pool: {
      min: pool.min,
      max: pool.max,
      idleTimeoutMillis: pool.idleTimeoutMillis,
    },
  });
};
