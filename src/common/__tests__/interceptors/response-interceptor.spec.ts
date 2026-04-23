import { ResponseInterceptor } from '../../interceptors';
import { firstValueFrom, of } from 'rxjs';

describe('ResponseInterceptor Unit Test', () => {
  let interceptor: ResponseInterceptor<any>;

  beforeEach(() => {
    interceptor = new ResponseInterceptor();
  });

  it('응답 변환 확인', async () => {
    // given
    const data = { foo: 'bar' };

    const callHandler = {
      handle: () => of(data),
    } as any;

    // when
    const result = await firstValueFrom(
      interceptor.intercept({} as any, callHandler),
    );

    // then
    expect(result).toEqual({
      status: 'success',
      data,
    });
  });
});
