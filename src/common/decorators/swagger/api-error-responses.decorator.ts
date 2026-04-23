import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ErrorResponseDto } from '../../dto/response.dto';

/**
 * 일반적인 에러 응답 메시지
 */
export const CommonErrorMessages = {
  BAD_REQUEST: '잘못된 요청입니다. 요청 데이터를 확인해주세요.',
  UNAUTHORIZED: '인증이 필요합니다. 로그인 후 다시 시도해주세요.',
  FORBIDDEN: '접근 권한이 없습니다.',
  NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',
  CONFLICT: '이미 존재하는 데이터입니다.',
  UNPROCESSABLE_ENTITY: '처리할 수 없는 요청입니다. 입력값을 확인해주세요.',
  TOO_MANY_REQUESTS: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.',
  INTERNAL_SERVER_ERROR:
    '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  SERVICE_UNAVAILABLE: '서비스를 일시적으로 사용할 수 없습니다.',
} as const;

/**
 * 에러 응답 타입
 */
export interface ErrorResponseConfig {
  status: HttpStatus;
  message: string;
  description?: string;
}

/**
 * Swagger 에러 응답 데코레이터
 *
 * @example
 * ```typescript
 * @ApiErrorResponses([
 *   { status: 400, message: '잘못된 요청' },
 *   { status: 404, message: '사용자를 찾을 수 없습니다' }
 * ])
 * ```
 */
export function ApiErrorResponses(errors: ErrorResponseConfig[]) {
  const decorators = errors.map(error =>
    ApiResponse({
      status: error.status,
      description: error.description || error.message,
      schema: {
        $ref: getSchemaPath(ErrorResponseDto),
        example: {
          statusCode: error.status,
          message: error.message,
        },
      },
    }),
  );

  return applyDecorators(ApiExtraModels(ErrorResponseDto), ...decorators);
}

/**
 * 일반적인 에러 응답들을 자동으로 추가하는 데코레이터
 *
 * @example
 * ```typescript
 * @ApiCommonErrorResponses(['BAD_REQUEST', 'UNAUTHORIZED', 'NOT_FOUND'])
 * ```
 */
export function ApiCommonErrorResponses(
  errorTypes: (keyof typeof CommonErrorMessages)[],
) {
  const errors: ErrorResponseConfig[] = errorTypes.map(type => {
    const statusMap: Record<keyof typeof CommonErrorMessages, HttpStatus> = {
      BAD_REQUEST: HttpStatus.BAD_REQUEST,
      UNAUTHORIZED: HttpStatus.UNAUTHORIZED,
      FORBIDDEN: HttpStatus.FORBIDDEN,
      NOT_FOUND: HttpStatus.NOT_FOUND,
      CONFLICT: HttpStatus.CONFLICT,
      UNPROCESSABLE_ENTITY: HttpStatus.UNPROCESSABLE_ENTITY,
      TOO_MANY_REQUESTS: HttpStatus.TOO_MANY_REQUESTS,
      INTERNAL_SERVER_ERROR: HttpStatus.INTERNAL_SERVER_ERROR,
      SERVICE_UNAVAILABLE: HttpStatus.SERVICE_UNAVAILABLE,
    };

    return {
      status: statusMap[type],
      message: CommonErrorMessages[type],
    };
  });

  return ApiErrorResponses(errors);
}
