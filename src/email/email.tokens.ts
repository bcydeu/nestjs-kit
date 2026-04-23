export const EMAIL_CLIENT = Symbol('EMAIL_CLIENT');
export const RESEND_STRATEGY_OPTIONS = Symbol('RESEND_STRATEGY_OPTIONS');

export interface ResendStrategyOptions {
  apiKey: string;
  from: string;
}
