import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

interface StringValidatorOptions {
  trim?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  enum?: Record<string, string | number>;
  optional?: boolean;
  message?: string;
  each?: boolean;
}

export type StringValidatorType = (
  opts?: StringValidatorOptions,
) => PropertyDecorator;

export function StringValidator(options: StringValidatorOptions = {}) {
  const decorators: PropertyDecorator[] = [];

  // 1) 값 가공(transform)
  if (options.trim) {
    decorators.push(
      Transform(({ value }) =>
        typeof value === 'string' ? value.trim() : value,
      ),
    );
  }

  // 2) optional 처리
  if (options.optional) {
    decorators.push(IsOptional());
  } else {
    decorators.push(IsNotEmpty());
  }

  const eachOption = options.each ? true : false;

  // 3) 기본 문자열 검사
  decorators.push(
    IsString({
      each: eachOption,

      message:
        options.message ??
        (eachOption
          ? '$property each elements must be a string'
          : '$property must be a string'),
    }),
  );

  // 4) 길이 제한
  if (
    typeof options.minLength === 'number' ||
    typeof options.maxLength === 'number'
  ) {
    decorators.push(
      Length(
        options.minLength ?? 0,
        options.maxLength ?? Number.MAX_SAFE_INTEGER,
        {
          each: eachOption,
          message:
            options.message ??
            (eachOption
              ? `$property each elements must be between ${options.minLength} and ${options.maxLength} characters`
              : `$property must be between ${options.minLength} and ${options.maxLength} characters`),
        },
      ),
    );
  }

  // 5) 패턴 검사
  if (options.pattern) {
    decorators.push(
      Matches(options.pattern, {
        each: eachOption,
        message:
          options.message ??
          (eachOption
            ? `$property each elements must match pattern ${options.pattern}`
            : `$property must match pattern ${options.pattern}`),
      }),
    );
  }

  // 6) enum(허용값) 검사
  if (options.enum) {
    const enumValues = Object.values(options.enum).filter(
      v => typeof v === 'string' || typeof v === 'number',
    );

    decorators.push(
      IsIn(enumValues, {
        each: eachOption,
        message:
          options.message ??
          (eachOption
            ? `$property each elements must be one of [${enumValues.join(', ')}]`
            : `$property must be one of [${enumValues.join(', ')}]`),
      }),
    );
  }

  return applyDecorators(...decorators);
}
