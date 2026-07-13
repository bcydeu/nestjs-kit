// 소비처가 주입받는 토큰 → SlackWebhookStrategy(SlackService) 인스턴스로 resolve된다.
export const SLACK_CLIENT = Symbol('SLACK_CLIENT');
export const SLACK_WEBHOOK_OPTIONS = Symbol('SLACK_WEBHOOK_OPTIONS');
// fetch 기반 HTTP poster. SlackModule이 생성해 등록하며 strategy에 주입된다
// (테스트에서는 stub 주입).
export const SLACK_HTTP_CLIENT = Symbol('SLACK_HTTP_CLIENT');

export interface SlackWebhookOptions {
  /** Incoming Webhook URL (예: https://hooks.slack.com/services/...). */
  webhookUrl: string;
  /** 모든 메시지에 적용할 기본 표시 이름(개별 메시지에서 override 가능). */
  username?: string;
  /** 모든 메시지에 적용할 기본 아이콘 이모지(개별 메시지에서 override 가능). */
  iconEmoji?: string;
  /** 배포 환경명(예: 'production'). 지정 시 에러 알림 헤더에 표시된다. */
  environment?: string;
}
