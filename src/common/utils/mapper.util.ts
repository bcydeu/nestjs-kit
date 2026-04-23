import {
  ClassConstructor,
  ClassTransformOptions,
  plainToInstance,
} from 'class-transformer';

export function convertToInstance<T, V extends Partial<T>>(
  dtoClass: ClassConstructor<T>,
  source: V[],
  options?: ClassTransformOptions,
): T[];
export function convertToInstance<T, V extends Partial<T>>(
  dtoClass: ClassConstructor<T>,
  source: V,
  options?: ClassTransformOptions,
): T;
export function convertToInstance<T, V>(
  dtoClass: ClassConstructor<T>,
  source: V | V[],
  options?: ClassTransformOptions,
): T | T[] {
  const transformOptions: ClassTransformOptions = {
    ...options,
    excludeExtraneousValues: true,
    enableImplicitConversion: true,
  };

  return plainToInstance(dtoClass, source, transformOptions);
}
