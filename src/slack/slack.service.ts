import { SlackErrorOptions, SlackMessage } from './slack.type';

export interface SlackService {
  /** 저수준 전송. blocks/channel 등 전체 페이로드를 직접 제어한다. */
  send(message: SlackMessage): Promise<void>;
  /** 한줄 텍스트 알림. */
  notify(text: string): Promise<void>;
  /** 에러를 제목·메시지·스택·컨텍스트로 포매팅해 전송한다. */
  sendError(error: unknown, options?: SlackErrorOptions): Promise<void>;
}
