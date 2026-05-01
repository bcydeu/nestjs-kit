import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { PaginatedResponseDto, PaginationMetaDto } from '../../dto/response.dto';

/**
 * Swagger 페이지네이션 응답 데코레이터
 *
 * @example
 * ```typescript
 * @ApiPaginatedResponse(UserDto, {
 *   summary: '사용자 목록 조회',
 *   example: [{id: 1, name: 'John'}]
 * })
 * ```
 */
export function ApiPaginatedResponse<T>(
  dataDto: Type<T>,
  options?: {
    summary?: string;
    description?: string;
    example?: unknown[];
  },
) {
  const {
    summary = '성공',
    description = '페이지네이션된 데이터 조회 성공',
    example,
  } = options || {};

  return applyDecorators(
    ApiExtraModels(PaginatedResponseDto, PaginationMetaDto, dataDto),
    ApiResponse({
      status: 200,
      description: `${summary} - ${description}`,
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedResponseDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(dataDto) },
              },
              meta: {
                $ref: getSchemaPath(PaginationMetaDto),
              },
            },
          },
        ],
        ...(example !== undefined
          ? {
              example: {
                status: 'success',
                data: example,
                meta: {
                  page: 1,
                  limit: 10,
                  total: 100,
                  totalPages: 10,
                  hasNext: true,
                  hasPrevious: false,
                },
              },
            }
          : {}),
      },
    }),
  );
}
