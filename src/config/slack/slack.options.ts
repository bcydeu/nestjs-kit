import { StringValidator } from '../../common';

export class SlackOptions {
  @StringValidator()
  webhookUrl: string;
}
