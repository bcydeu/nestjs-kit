import { HttpStatus } from '@nestjs/common';
import { AppException } from '../../errors/app.exception';
import { UiMessages } from '../../constants/ui-messages';

describe('AppException', () => {
  it('uiMessage / systemMessage / status를 정확히 보존한다', () => {
    const ex = new AppException(UiMessages.NOT_FOUND, 'user not found in db', HttpStatus.NOT_FOUND);

    expect(ex.uiMessage).toBe(UiMessages.NOT_FOUND);
    expect(ex.systemMessage).toBe('user not found in db');
    expect(ex.getStatus()).toBe(HttpStatus.NOT_FOUND);
  });

  it('HttpException.message는 systemMessage로 노출된다', () => {
    const ex = new AppException(
      UiMessages.INTERNAL_SERVER_ERROR,
      'unexpected token at line 42',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    expect(ex.message).toBe('unexpected token at line 42');
  });

  it('getResponse()는 { uiMessage } 형태를 반환한다 (AllCatchExceptionFilter 계약)', () => {
    const ex = new AppException(UiMessages.UNAUTHORIZED, 'jwt expired', HttpStatus.UNAUTHORIZED);

    const payload = ex.getResponse() as { uiMessage: string };

    expect(payload).toEqual({ uiMessage: UiMessages.UNAUTHORIZED });
    expect(payload.uiMessage).toBe(UiMessages.UNAUTHORIZED);
  });

  it('response 프로퍼티는 writable=false로 고정된다', () => {
    const ex = new AppException(UiMessages.BAD_REQUEST, 'invalid input', HttpStatus.BAD_REQUEST);

    expect(() => {
      (ex as unknown as { response: unknown }).response = { uiMessage: 'tampered' };
    }).toThrow(TypeError);

    expect((ex.getResponse() as { uiMessage: string }).uiMessage).toBe(UiMessages.BAD_REQUEST);
  });

  it('도메인 메시지(EMAIL_ALREADY_EXISTS 등)도 동일하게 동작한다', () => {
    const ex = new AppException(
      UiMessages.EMAIL_ALREADY_EXISTS,
      'duplicate email: foo@bar.com',
      HttpStatus.CONFLICT,
    );

    expect(ex.uiMessage).toBe(UiMessages.EMAIL_ALREADY_EXISTS);
    expect(ex.getStatus()).toBe(HttpStatus.CONFLICT);
    expect(ex.getResponse()).toEqual({ uiMessage: UiMessages.EMAIL_ALREADY_EXISTS });
  });
});
