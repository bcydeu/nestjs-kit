import { NumberValidator, StringValidator } from '../../common';

export class SentryOptions {
  @StringValidator()
  dsn!: string;

  @NumberValidator()
  tracesSampleRate!: number;

  @NumberValidator()
  profilesSampleRate!: number;
}
