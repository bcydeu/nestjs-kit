import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AppException, UiMessages } from '../common';
import { JWT_USER_OPTIONS, JwtUserOptions } from './security.tokens';

export interface JwtUserPayload {
  sub: number;
}

@Injectable()
export class JwtUserStrategy extends PassportStrategy(Strategy, 'jwt-user') {
  constructor(@Inject(JWT_USER_OPTIONS) options: JwtUserOptions) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request) => req?.cookies?.access_token,
      ]),
      ignoreExpiration: false,
      secretOrKey: options.secret,
    });
  }

  validate({ sub }: JwtUserPayload) {
    if (!sub) {
      throw new AppException(
        UiMessages.UNAUTHORIZED,
        'Not found sub',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return { userId: sub };
  }
}
