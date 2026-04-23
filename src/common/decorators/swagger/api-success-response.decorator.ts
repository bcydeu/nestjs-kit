import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { SuccessResponseDto } from '../../dto/response.dto';

/**
 * Swagger 성공 응답 데코레이터
 *
 * @example
 * ```typescript
 * @ApiSuccessResponse(UserDto, {
 *   summary: '사용자 조회 성공',
 *   example: { id: 1, name: 'John', email: 'john@example.com' }
 * })
 * ```
 */
export function ApiSuccessResponse<T>(
  dataDto?: Type<T>,
  options?: {
    summary?: string;
    description?: string;
    example?: any;
    isArray?: boolean;
    status?: number;
  },
) {
  const {
    summary = '성공',
    description = '요청이 성공적으로 처리되었습니다.',
    example,
    isArray = false,
    status = 200,
  } = options || {};

  // DTO가 제공되지 않은 경우 (primitive type 또는 any)
  if (!dataDto) {
    return applyDecorators(
      ApiResponse({
        status,
        description: `${summary} - ${description}`,
        schema: {
          properties: {
            status: {
              type: 'string',
              example: 'success',
              enum: ['success'],
            },
            data: example
              ? { example }
              : {
                  type: isArray ? 'array' : 'object',
                  ...(isArray && { items: { type: 'object' } }),
                },
          },
        },
      }),
    );
  }

  // DTO가 제공된 경우
  return applyDecorators(
    ApiExtraModels(SuccessResponseDto, dataDto),
    ApiResponse({
      status,
      description: `${summary} - ${description}`,
      schema: {
        allOf: [
          { $ref: getSchemaPath(SuccessResponseDto) },
          {
            properties: {
              data: isArray
                ? {
                    type: 'array',
                    items: { $ref: getSchemaPath(dataDto) },
                  }
                : {
                    $ref: getSchemaPath(dataDto),
                  },
            },
          },
        ],
        ...(example && { example: { status: 'success', data: example } }),
      },
    }),
  );
}
