import { ValidationPipeOptions } from '@nestjs/common';

export function getValidationPipeOptions(): ValidationPipeOptions {
  return {
    whitelist: true, // DTO에 선언되지 않은 프로퍼티 -> 제거
    forbidNonWhitelisted: true, // whitelist랑 함께라 DTO에 선언되지 않은 프로터피 -> 에러
    transform: true, // request plain object -> DTO instance
    transformOptions: {
      enableImplicitConversion: true, // DTO 타입 메타데이터 보고 형변환
      excludeExtraneousValues: true, // DTO에 선언되지 않은 프로퍼티 변환 안함
    },
  };
}
