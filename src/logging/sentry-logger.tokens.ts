export const SENTRY_LOGGER_OPTIONS = Symbol('SENTRY_LOGGER_OPTIONS');
// sentry 클라이언트(SentryLike)를 주입하기 위한 토큰. SentryLoggerModule이 생성해 등록한다.
export const SENTRY_CLIENT = Symbol('SENTRY_CLIENT');

export interface SentryLoggerOptions {
  /** 이 context 이름의 로그는 Sentry 전송을 스킵한다. 기본값은 헬스체크/부트스트랩 노이즈 필터. */
  ignoredContexts?: string[];
  /** Sentry 전송을 건너뛸 NODE_ENV 판정 함수. 기본은 production이 아닐 때 스킵. */
  isProduction?: () => boolean;
}

export const DEFAULT_IGNORED_CONTEXTS = [
  'Terminus',
  'HealthController',
  'HealthCheckService',
  'RouterExplorer',
  'InstanceLoader',
];
