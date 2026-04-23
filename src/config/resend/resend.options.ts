import { StringValidator } from '../../common';

export class ResendOptions {
  @StringValidator()
  apiKey: string;

  @StringValidator()
  from: string;
}
