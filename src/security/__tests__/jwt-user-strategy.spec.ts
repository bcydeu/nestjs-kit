import { HttpStatus } from '@nestjs/common';
import { AppException, UiMessages } from '../../common';
import { JwtUserStrategy } from '../jwt-user.strategy';

describe('JwtUserStrategy Unit Test', () => {
  let strategy: JwtUserStrategy;

  beforeEach(() => {
    strategy = new JwtUserStrategy({ secret: 'test_jwt_secret' });
  });

  describe('validate()', () => {
    it('payload의 sub 프로퍼티가 falsy인 경우 AppException', () => {
      const falsySubs = [null, undefined];

      falsySubs.forEach((sub: any) => {
        const result = () => strategy.validate({ sub });
        expect(result).toThrow(
          new AppException(
            UiMessages.UNAUTHORIZED,
            `Not found sub`,
            HttpStatus.UNAUTHORIZED,
          ),
        );
      });
    });

    it('payload의 sub가 유효하면 userId로 매핑하여 반환한다', () => {
      const result = strategy.validate({ sub: 42 });
      expect(result).toEqual({ userId: 42 });
    });
  });
});
