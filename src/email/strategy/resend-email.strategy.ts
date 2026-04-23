import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { EmailService } from '../email.service';
import { EmailPayload } from '../email.type';
import {
  RESEND_STRATEGY_OPTIONS,
  ResendStrategyOptions,
} from '../email.tokens';

// resend는 optional peer. 실제로 Strategy를 인스턴스화할 때 require해서
// 미설치 환경의 소비처가 kit/email 서브패스를 import만 해도 되도록 허용한다.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ResendCtor = new (apiKey: string) => any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ResendInstance = any;

function loadResend(): ResendCtor {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('resend');
    return mod.Resend as ResendCtor;
  } catch {
    throw new Error(
      '`resend` 패키지가 설치되어 있지 않습니다. `npm install resend`로 설치 후 사용하세요.',
    );
  }
}

@Injectable()
export class ResendEmailStrategy implements EmailService {
  private readonly resend: ResendInstance;
  private readonly from: string;
  private readonly logger = new Logger(ResendEmailStrategy.name);

  constructor(
    @Inject(RESEND_STRATEGY_OPTIONS) options: ResendStrategyOptions,
  ) {
    const Resend = loadResend();
    this.resend = new Resend(options.apiKey);
    this.from = options.from;
  }

  async send(payload: EmailPayload): Promise<void> {
    try {
      await this.resend.emails.send({
        from: payload.from ?? this.from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      });
    } catch (error) {
      this.logger.error('Failed to send email via Resend API', {
        err: error,
        payload,
      });

      throw new InternalServerErrorException(
        'Failed to send email via Resend API',
      );
    }
  }

  async sendBatch(payloads: EmailPayload[]): Promise<void> {
    try {
      const emails = payloads.map(payload => ({
        from: payload.from ?? this.from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      }));
      await this.resend.batch.send(emails);
    } catch (error) {
      this.logger.error('Failed to send batch emails via Resend API', {
        err: error,
        payloads,
      });

      throw new InternalServerErrorException(
        'Failed to send batch emails via Resend API',
      );
    }
  }
}
