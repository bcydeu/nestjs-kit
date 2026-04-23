import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtUserGuard } from '../jwt-user.guard';
import { PublicApi, IS_PUBLIC_KEY } from '../public-api.decorator';

function makeContext(handler: unknown, cls: unknown): ExecutionContext {
  return {
    getHandler: () => handler,
    getClass: () => cls,
    switchToHttp: () => ({
      getRequest: () => ({}),
      getResponse: () => ({}),
    }),
  } as unknown as ExecutionContext;
}

describe('JwtUserGuard', () => {
  let reflector: Reflector;
  let guard: JwtUserGuard;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtUserGuard(reflector);
  });

  it('@PublicApi() 메서드에는 인증 검사를 건너뛰고 true를 반환한다', () => {
    class Ctrl {
      @PublicApi()
      publicHandler() {}
    }

    const ctx = makeContext(Ctrl.prototype.publicHandler, Ctrl);
    const result = guard.canActivate(ctx);

    expect(result).toBe(true);
  });

  it('클래스 레벨 @PublicApi()도 유효하다', () => {
    @PublicApi()
    class PublicCtrl {
      handler() {}
    }

    const ctx = makeContext(PublicCtrl.prototype.handler, PublicCtrl);
    const result = guard.canActivate(ctx);

    expect(result).toBe(true);
  });

  it('@PublicApi()가 없으면 reflector가 undefined를 반환한다', () => {
    class Ctrl {
      protectedHandler() {}
    }

    const isPublic = reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      Ctrl.prototype.protectedHandler,
      Ctrl,
    ]);

    expect(isPublic).toBeUndefined();
    // super.canActivate는 passport strategy 초기화에 의존하므로
    // 유닛 테스트에서는 호출하지 않는다 (security.module.spec.ts에서 통합적으로 검증)
  });

  it('클래스 @PublicApi()는 메서드까지 override 된다 (reflector getAllAndOverride)', () => {
    @PublicApi()
    class InheritedPublic {
      handler() {}
    }

    const value = reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      InheritedPublic.prototype.handler,
      InheritedPublic,
    ]);

    expect(value).toBe(true);
  });
});
