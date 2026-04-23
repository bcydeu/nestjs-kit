import { StringValidator } from '../../common';

export class JwtOptions {
  @StringValidator()
  secret!: string;

  @StringValidator()
  expiresIn!: string;
}
