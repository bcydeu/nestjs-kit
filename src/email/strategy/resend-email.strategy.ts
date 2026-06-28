import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { EmailService } from '../email.service';
import { EmailPayload } from '../email.type';
import {
  RESEND_CLIENT,
  RESEND_STRATEGY_OPTIONS,
  type ResendStrategyOptions,
} from '../email.tokens';

@Injectable()
export class ResendEmailStrategy implements EmailService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly resend: any;
  private readonly from: string;
  private readonly logger = new Logger(ResendEmailStrategy.name);

  constructor(
    @Inject(RESEND_STRATEGY_OPTIONS) options: ResendStrategyOptions,
    // resend 클라이언트는 EmailModule이 생성해 주입한다(테스트에서는 stub 주입).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Inject(RESEND_CLIENT) resend: any,
  ) {
    this.resend = resend;
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

      throw new InternalServerErrorException('Failed to send email via Resend API');
    }
  }

  async sendBatch(payloads: EmailPayload[]): Promise<void> {
    try {
      const emails = payloads.map((payload) => ({
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

      throw new InternalServerErrorException('Failed to send batch emails via Resend API');
    }
  }
}
