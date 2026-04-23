import { applyDecorators } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional } from 'class-validator';

export interface DateValidatorOptions {
  optional?: boolean;
  message?: string;
  each?: boolean;
}

export type DateValidatorType = (
  opts?: DateValidatorOptions,
) => PropertyDecorator;

export function DateValidator(
  options: DateValidatorOptions = {},
): PropertyDecorator {
  const decorators: PropertyDecorator[] = [];

  // 1) optional 처리
  if (options.optional) {
    decorators.push(IsOptional());
  } else {
    decorators.push(IsNotEmpty());
  }

  decorators.push(Type(() => Date));

  const eachOption = options.each ? true : false;

  // 2) Date 타입 검사
  decorators.push(
    IsDate({
      each: eachOption,
      message:
        options.message ??
        (eachOption
          ? `$property each elements must be a Date`
          : `$property must be a Date`),
    }),
  );

  return applyDecorators(...decorators);
}
