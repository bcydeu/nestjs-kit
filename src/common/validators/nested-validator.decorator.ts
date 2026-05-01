import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { ClassConstructor, Type } from 'class-transformer';
import { applyDecorators } from '@nestjs/common';

export interface NestedValidatorOptions {
  type: () => ClassConstructor<unknown>;
  optional?: boolean;
  each?: boolean;
}

export type NestedValidatorType = (opts: NestedValidatorOptions) => PropertyDecorator;

export function NestedValidator(options: NestedValidatorOptions): PropertyDecorator {
  const decorators: PropertyDecorator[] = [];

  if (options.optional) {
    decorators.push(IsOptional());
  } else {
    decorators.push(IsNotEmpty());
  }

  decorators.push(ValidateNested({ each: options.each ? true : false }));
  decorators.push(Type(options.type));

  return applyDecorators(...decorators);
}
