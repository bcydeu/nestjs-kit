import { InjectionToken, Provider, Type } from '@nestjs/common';

/**
 *
 * @param token Injection 토큰 (string | symbol)
 * @param useClass 주입할 클래스 타입
 */
export function createUseClassProvider<T>(
  token: InjectionToken,
  useClass: Type<T>,
): Provider {
  return {
    provide: token,
    useClass,
  };
}
