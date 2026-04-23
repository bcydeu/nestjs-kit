import {
  NestedValidator,
  NumberValidator,
  StringValidator,
} from '../../common';
import { OrmDriverOptions } from './orm-driver.options';
import { OrmPoolOptions } from './orm-pool.options';

export class OrmOptions {
  @StringValidator()
  dbName: string;

  @StringValidator()
  host: string;

  @NumberValidator()
  port: number;

  @StringValidator()
  user: string;

  @StringValidator()
  password: string;

  @NestedValidator({ type: () => OrmDriverOptions })
  driverOptions: OrmDriverOptions;

  @NestedValidator({ type: () => OrmPoolOptions })
  pool: OrmPoolOptions;
}
