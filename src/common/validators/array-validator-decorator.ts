import { applyDecorators } from '@nestjs/common';
import {
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { BooleanValidatorType } from './boolean-validator.decorator';
import { DateValidatorType } from './date-validator.decorator';
import {
  NestedValidator,
  NestedValidatorOptions,
  NestedValidatorType,
} from './nested-validator.decorator';
import { NumberValidatorType } from './number-validator.decorator';
import { StringValidatorType } from './string-validator.decorator';

export type ValidatorType =
  | StringValidatorType
  | NumberValidatorType
  | DateValidatorType
  | BooleanValidatorType
  | NestedValidatorType;

function isNestedValidator(
  decorator: ValidatorType,
): decorator is NestedValidatorType {
  return decorator === NestedValidator;
}

export interface ArrayValidatorOptions {
  optional?: boolean;
  minItems?: number;
  maxItems?: number;
  message?: string;
}

export interface ElementValidatorConfig<D extends ValidatorType> {
  /**
   *
   * StringValidator, NumberValidator ...
   */
  decorator: D;
  /**
   *
   * 해당 데코레이터의 옵션 (each는 내부에서 자동 처리)
   */
  options: Omit<NonNullable<Parameters<D>[0]>, 'each'>;
}

export function ArrayValidator<D extends ValidatorType>(
  options: ArrayValidatorOptions = {},
  elementValidator?: ElementValidatorConfig<D>,
) {
  const decorators: PropertyDecorator[] = [];

  if (options.optional) {
    decorators.push(IsOptional());
  } else {
    decorators.push(IsNotEmpty());
  }

  decorators.push(
    IsArray({ message: options.message ?? `$property must be an array` }),
  );

  if (options.minItems) {
    decorators.push(
      ArrayMinSize(options.minItems, {
        message:
          options.message ??
          `$property must contain at least ${options.minItems} items`,
      }),
    );
  }

  if (options.maxItems) {
    decorators.push(
      ArrayMaxSize(options.maxItems, {
        message:
          options.message ??
          `$property must contain no more than ${options.maxItems} items`,
      }),
    );
  }

  if (elementValidator) {
    const { decorator, options: elementOpts } = elementValidator;

    if (isNestedValidator(decorator)) {
      decorators.push(
        NestedValidator({
          ...(elementOpts as NestedValidatorOptions),
          each: true, // each: true 자동 적용
        }),
      );
    } else {
      decorators.push(
        decorator({
          ...elementOpts,
          each: true, // each: true 자동 적용
        }),
      );
    }
  }

  return applyDecorators(...decorators);
}
