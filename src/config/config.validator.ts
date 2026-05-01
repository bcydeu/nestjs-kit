import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

export type ConfigEnvMapper<T> = (env: Record<string, unknown>) => T;

/**
 * `ConfigModule.forRoot({ validate })`에 꽂을 검증 콜백을 생성한다.
 *
 * 프로젝트마다 ConfigurationDTO 필드 조합과 env 매핑이 다르므로 kit은
 * 제네릭 팩토리만 제공하고, 소비처에서 DTO 클래스와 mapper를 주입한다.
 *
 * @example
 *   export const configValidateFn = createConfigValidator(
 *     ConfigurationDTO,
 *     mapEnvToConfig,
 *   );
 */
export function createConfigValidator<T extends object>(
  DtoClass: ClassConstructor<T>,
  mapper: ConfigEnvMapper<T>,
): (config: Record<string, unknown>) => Record<string, unknown> {
  return (config: Record<string, unknown>) => {
    const dto = plainToInstance(DtoClass, mapper(config), {
      enableImplicitConversion: true,
    });

    const errors = validateSync(dto as object, {
      skipMissingProperties: false,
    });

    if (errors.length) {
      throw new Error(`config validation error:\n- ${errors.toString()}`);
    }

    return config;
  };
}
