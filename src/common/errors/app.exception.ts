import { HttpException, HttpStatus } from '@nestjs/common';
import { UiMessages } from '../constants/ui-messages';

export class AppException extends HttpException {
  constructor(
    // 표준 UiMessages 9개는 자동완성으로 안내하되, 도메인 정의 문구도 캐스트 없이 허용한다.
    // `string & {}`는 리터럴 union의 자동완성 힌트를 유지하기 위한 패턴
    // (그냥 `| string`이면 union이 string으로 흡수되어 9개 힌트가 사라진다).
    readonly uiMessage: UiMessages | (string & {}),
    readonly systemMessage: string,
    status: HttpStatus,
  ) {
    super(systemMessage, status);

    Object.defineProperty(this, 'response', {
      value: { uiMessage },
      writable: false,
    });
  }
}
