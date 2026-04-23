import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export interface BooleanValidatorOptions {
  optional?: boolean;
  message?: string;
  each?: boolean;
}

export type BooleanValidatorType = (
  opts?: BooleanValidatorOptions,
) => PropertyDecorator;

export function BooleanValidator(
  options: BooleanValidatorOptions = {},
): PropertyDecorator {
  const decorators: PropertyDecorator[] = [];

  if (options.optional) {
    decorators.push(IsOptional());
  } else {
    decorators.push(IsNotEmpty());
  }

  // ValidationPipe의  enableImplicitConversion 옵션때문에
  // 문자열을 항상 true로 반환한다.
  // 이 문제를 해결하기 위해 기존 값에 접근하여 변환
  decorators.push(
    Transform(({ obj, key }) => {
      if (obj[key] === 'true') return true;
      if (obj[key] === 'false') return false;
      return obj[key];
    }),
  );

  const eachOption = options.each ? true : false;
  const message =
    options.message ??
    (eachOption
      ? '$property each elements must be a boolean'
      : '$property must be a boolean');

  decorators.push(IsBoolean({ each: eachOption, message }));

  return applyDecorators(...decorators);
}
