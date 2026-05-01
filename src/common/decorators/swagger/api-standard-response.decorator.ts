import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import { ApiSuccessResponse } from './api-success-response.decorator';
import {
  ApiCommonErrorResponses,
  ApiErrorResponses,
  ErrorResponseConfig,
} from './api-error-responses.decorator';

/**
 * 표준 API 응답 데코레이터 (성공 + 일반적인 에러)
 * 성공 응답과 일반적인 에러 응답을 한번에 설정합니다.
 *
 * @example
 * ```typescript
 * @ApiStandardResponse(UserDto, {
 *   summary: '사용자 조회',
 *   successExample: { id: 1, name: 'John' },
 *   errorTypes: ['NOT_FOUND', 'UNAUTHORIZED']
 * })
 * ```
 */
export function ApiStandardResponse<T>(
  dataDto?: Type<T>,
  options?: {
    summary?: string;
    description?: string;
    successExample?: unknown;
    isArray?: boolean;
    status?: number;
    errorTypes?: (
      | 'BAD_REQUEST'
      | 'UNAUTHORIZED'
      | 'FORBIDDEN'
      | 'NOT_FOUND'
      | 'CONFLICT'
      | 'UNPROCESSABLE_ENTITY'
      | 'TOO_MANY_REQUESTS'
      | 'INTERNAL_SERVER_ERROR'
      | 'SERVICE_UNAVAILABLE'
    )[];
    customErrors?: ErrorResponseConfig[];
  },
) {
  const {
    summary,
    description,
    successExample,
    isArray = false,
    status = 200,
    errorTypes = ['BAD_REQUEST', 'INTERNAL_SERVER_ERROR'],
    customErrors = [],
  } = options || {};

  const decorators = [
    ApiSuccessResponse(dataDto, {
      summary,
      description,
      example: successExample,
      isArray,
      status,
    }),
  ];

  // 일반적인 에러 추가
  if (errorTypes.length > 0) {
    decorators.push(ApiCommonErrorResponses(errorTypes));
  }

  // 커스텀 에러 추가
  if (customErrors.length > 0) {
    decorators.push(ApiErrorResponses(customErrors));
  }

  return applyDecorators(...decorators);
}

/**
 * CRUD 생성(POST) API 표준 응답
 *
 * @example
 * ```typescript
 * @ApiCreateResponse(UserDto, {
 *   summary: '사용자 생성',
 *   example: { id: 1, name: 'John' }
 * })
 * ```
 */
export function ApiCreateResponse<T>(
  dataDto: Type<T>,
  options?: {
    summary?: string;
    description?: string;
    example?: unknown;
  },
) {
  return ApiStandardResponse(dataDto, {
    ...options,
    status: HttpStatus.CREATED,
    errorTypes: ['BAD_REQUEST', 'CONFLICT', 'UNAUTHORIZED', 'FORBIDDEN'],
  });
}

/**
 * CRUD 조회(GET) API 표준 응답
 *
 * @example
 * ```typescript
 * @ApiGetResponse(UserDto, {
 *   summary: '사용자 조회',
 *   example: { id: 1, name: 'John' }
 * })
 * ```
 */
export function ApiGetResponse<T>(
  dataDto: Type<T>,
  options?: {
    summary?: string;
    description?: string;
    example?: unknown;
    isArray?: boolean;
  },
) {
  return ApiStandardResponse(dataDto, {
    ...options,
    errorTypes: ['NOT_FOUND', 'UNAUTHORIZED', 'FORBIDDEN'],
  });
}

/**
 * CRUD 수정(PUT/PATCH) API 표준 응답
 *
 * @example
 * ```typescript
 * @ApiUpdateResponse(UserDto, {
 *   summary: '사용자 수정',
 *   example: { id: 1, name: 'John Updated' }
 * })
 * ```
 */
export function ApiUpdateResponse<T>(
  dataDto: Type<T>,
  options?: {
    summary?: string;
    description?: string;
    example?: unknown;
  },
) {
  return ApiStandardResponse(dataDto, {
    ...options,
    errorTypes: ['BAD_REQUEST', 'NOT_FOUND', 'UNAUTHORIZED', 'FORBIDDEN', 'CONFLICT'],
  });
}

/**
 * CRUD 삭제(DELETE) API 표준 응답
 *
 * @example
 * ```typescript
 * @ApiDeleteResponse({
 *   summary: '사용자 삭제',
 *   example: { message: '삭제되었습니다' }
 * })
 * ```
 */
export function ApiDeleteResponse(options?: {
  summary?: string;
  description?: string;
  example?: unknown;
}) {
  return ApiStandardResponse(undefined, {
    ...options,
    status: HttpStatus.OK,
    successExample: options?.example || { message: '삭제되었습니다' },
    errorTypes: ['NOT_FOUND', 'UNAUTHORIZED', 'FORBIDDEN', 'CONFLICT'],
  });
}
