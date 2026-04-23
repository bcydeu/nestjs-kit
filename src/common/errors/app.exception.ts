import { HttpException, HttpStatus } from '@nestjs/common';
import { UiMessages } from '../constants/ui-messages';

export class AppException extends HttpException {
  constructor(
    readonly uiMessage: UiMessages,
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
