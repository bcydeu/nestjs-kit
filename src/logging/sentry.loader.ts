// @sentry/nestjs는 optional peer. 미설치 환경에서는 no-op 처리.
// DSN 등 실제 Sentry 초기화는 소비처가 instrument.ts 등에서 수행하고,
// 이 로거는 이미 초기화된 Sentry의 logger/addBreadcrumb API만 사용한다.

/* eslint-disable @typescript-eslint/no-explicit-any */
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
/* eslint-enable @typescript-eslint/no-explicit-any */

const NOOP_SENTRY: SentryLike = {
  addBreadcrumb: () => undefined,
};

let cached: SentryLike | null = null;

export function loadSentry(): SentryLike {
  if (cached) return cached;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cached = require('@sentry/nestjs') as SentryLike;
  } catch {
    cached = NOOP_SENTRY;
  }
  return cached;
}
