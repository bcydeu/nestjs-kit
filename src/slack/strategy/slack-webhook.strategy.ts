import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { SlackService } from '../slack.service';
import { SlackErrorLevel, SlackErrorOptions, SlackMessage } from '../slack.type';
import type { SlackHttpClient } from '../slack.client';
import {
  SLACK_HTTP_CLIENT,
  SLACK_WEBHOOK_OPTIONS,
  type SlackWebhookOptions,
} from '../slack.tokens';

// 스택은 Slack 메시지 한도를 넘기기 쉬우므로 안전 길이로 자른다.
const STACK_LIMIT = 2800;

// 레벨별 attachment color 바 + 헤더 이모지. color는 Slack 관용값(good/warning/danger)
// 또는 hex를 쓴다.
const LEVEL_META: Record<SlackErrorLevel, { color: string; emoji: string }> = {
  warn: { color: 'warning', emoji: ':warning:' },
  error: { color: 'danger', emoji: ':rotating_light:' },
  fatal: { color: '#8b0000', emoji: ':skull:' },
};

@Injectable()
export class SlackWebhookStrategy implements SlackService {
  private readonly logger = new Logger(SlackWebhookStrategy.name);
  private readonly webhookUrl: string;
  private readonly defaultUsername?: string;
  private readonly defaultIconEmoji?: string;
  private readonly environment?: string;

  constructor(
    @Inject(SLACK_WEBHOOK_OPTIONS) options: SlackWebhookOptions,
    // HTTP poster는 SlackModule이 생성해 주입한다(테스트에서는 stub 주입).
    @Inject(SLACK_HTTP_CLIENT) private readonly http: SlackHttpClient,
  ) {
    this.webhookUrl = options.webhookUrl;
    this.defaultUsername = options.username;
    this.defaultIconEmoji = options.iconEmoji;
    this.environment = options.environment;
  }

  async send(message: SlackMessage): Promise<void> {
    // undefined 필드는 JSON.stringify 단계에서 자동 제거되므로 그대로 매핑한다.
    const body = {
      text: message.text,
      blocks: message.blocks,
      attachments: message.attachments,
      channel: message.channel,
      username: message.username ?? this.defaultUsername,
      icon_emoji: message.iconEmoji ?? this.defaultIconEmoji,
    };

    try {
      const res = await this.http.post(this.webhookUrl, body);
      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        throw new Error(`status ${res.status}${detail ? `: ${detail}` : ''}`);
      }
    } catch (error) {
      this.logger.error('Failed to send message via Slack webhook', {
        err: error,
        message,
      });

      throw new InternalServerErrorException('Failed to send message via Slack webhook');
    }
  }

  async notify(text: string): Promise<void> {
    await this.send({ text });
  }

  async sendError(error: unknown, options: SlackErrorOptions = {}): Promise<void> {
    const err = error instanceof Error ? error : new Error(String(error));
    const level = options.level ?? 'error';
    const meta = LEVEL_META[level];
    const title = options.title ?? (err.name || 'Error');

    // 헤더: 이모지 + [환경] + 제목. 환경은 배포 상수(모듈 옵션)에서 온다.
    const header = this.environment
      ? `${meta.emoji} *[${this.environment}]* *${title}*`
      : `${meta.emoji} *${title}*`;

    const detail: string[] = [];
    if (err.message) {
      detail.push(err.message);
    }

    const context = options.context;
    if (context && Object.keys(context).length > 0) {
      detail.push(
        Object.entries(context)
          .map(([key, value]) => `• *${key}*: ${this.stringifyContext(value)}`)
          .join('\n'),
      );
    }

    if (err.stack) {
      const stack =
        err.stack.length > STACK_LIMIT
          ? `${err.stack.slice(0, STACK_LIMIT)}\n… (truncated)`
          : err.stack;
      detail.push('```' + stack + '```');
    }

    // 심각도는 attachment color 바로, 상세는 그 안에 담는다. 상단 text는 알림
    // 미리보기/fallback 용도.
    await this.send({
      text: header,
      attachments: [{ color: meta.color, text: detail.join('\n') }],
      channel: options.channel,
    });
  }

  private stringifyContext(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }

    try {
      return JSON.stringify(value) ?? String(value);
    } catch {
      return String(value);
    }
  }
}
