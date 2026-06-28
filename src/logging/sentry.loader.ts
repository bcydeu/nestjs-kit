// @sentry/nestjs는 optional peer. 미설치 환경에서는 no-op 처리.
// DSN 등 실제 Sentry 초기화는 소비처가 instrument.ts 등에서 수행하고,
// 이 로거는 이미 초기화된 Sentry의 logger/addBreadcrumb API만 사용한다.

export interface SentryLike {
  logger?: {
    info: (message: string, extra?: Record<string, unknown>) => void;
    warn: (message: string, extra?: Record<string, unknown>) => void;
    error: (message: string, extra?: Record<string, unknown>) => void;
  };
  addBreadcrumb: (breadcrumb: {
    category?: string;
    message?: string;
    level?: string;
    data?: Record<string, unknown>;
  }) => void;
}

const NOOP_SENTRY: SentryLike = {
  addBreadcrumb: () => undefined,
};

let cached: SentryLike | null = null;

// require 인자는 테스트 주입을 위해 노출한다
// (vitest는 native require() 모킹을 지원하지 않으므로 로더 함수 경계에서 주입).
export function loadSentry(req: (id: string) => unknown = require): SentryLike {
  if (cached) return cached;
  try {
    cached = req('@sentry/nestjs') as SentryLike;
  } catch {
    cached = NOOP_SENTRY;
  }
  return cached;
}
