export const EMAIL_CLIENT = Symbol('EMAIL_CLIENT');
export const RESEND_STRATEGY_OPTIONS = Symbol('RESEND_STRATEGY_OPTIONS');
// resend 클라이언트 인스턴스를 주입하기 위한 토큰. EmailModule이 생성해 등록한다.
export const RESEND_CLIENT = Symbol('RESEND_CLIENT');

export interface ResendStrategyOptions {
  apiKey: string;
  from: string;
}
