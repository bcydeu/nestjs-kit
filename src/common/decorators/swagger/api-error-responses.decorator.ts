import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ErrorResponseDto } from '../../dto/response.dto';
import { UiMessages } from '../../constants/ui-messages';

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
  const decorators = errors.map((error) =>
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

const StatusByMessageKey: Record<keyof typeof UiMessages, HttpStatus> = {
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

/**
 * 표준 HTTP 에러 응답들을 자동으로 추가하는 데코레이터.
 * 메시지는 `UiMessages`(`AllCatchExceptionFilter`도 사용)를 그대로 노출한다.
 *
 * @example
 * ```typescript
 * @ApiCommonErrorResponses(['BAD_REQUEST', 'UNAUTHORIZED', 'NOT_FOUND'])
 * ```
 */
export function ApiCommonErrorResponses(errorTypes: (keyof typeof UiMessages)[]) {
  const errors: ErrorResponseConfig[] = errorTypes.map((type) => ({
    status: StatusByMessageKey[type],
    message: UiMessages[type],
  }));

  return ApiErrorResponses(errors);
}
