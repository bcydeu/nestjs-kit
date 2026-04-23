const DefaultUiErrorMessages = {
  BAD_REQUEST: '잘못된 요청입니다.', // 400
  UNAUTHORIZED: '인증이 필요합니다.', // 401
  FORBIDDEN: '접근 권한이 없습니다.', // 403
  NOT_FOUND: '요청하신 자원을 찾을 수 없습니다.', // 404
  CONFLICT: '요청이 현재 리소스 상태와 충돌합니다.', // 409
  UNPROCESSABLE_ENTITY: '요청을 처리할 수 없습니다.', // 422
  TOO_MANY_REQUESTS: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.', // 429
  INTERNAL_SERVER_ERROR: '서버 내부 오류가 발생했습니다.', // 500
} as const;

const DomainUiErrorMessages = {
  EMAIL_ALREADY_EXISTS: '이미 사용 중인 이메일입니다.',
  INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다.',
} as const;

export const UiMessages = {
  ...DefaultUiErrorMessages,
  ...DomainUiErrorMessages,
} as const;

export type UiMessages = (typeof UiMessages)[keyof typeof UiMessages];
