import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY, PublicApi } from '../public-api.decorator';

describe('PublicApi', () => {
  it('IS_PUBLIC_KEY 메타데이터를 true로 설정한다', () => {
    class Target {
      @PublicApi()
      handler() {}
    }

    const reflector = new Reflector();
    const value = reflector.get<boolean>(IS_PUBLIC_KEY, Target.prototype.handler);

    expect(value).toBe(true);
  });

  it('클래스 레벨에도 적용 가능하다', () => {
    @PublicApi()
    class PublicTarget {}

    const reflector = new Reflector();
    const value = reflector.get<boolean>(IS_PUBLIC_KEY, PublicTarget);

    expect(value).toBe(true);
  });

  it('IS_PUBLIC_KEY 상수값은 isPublic', () => {
    expect(IS_PUBLIC_KEY).toBe('isPublic');
  });
});
