import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { UiMessages } from '../constants/ui-messages';

// @sentry/nestjs는 optional peer이므로 미설치 환경에서도 동작하도록 no-op fallback.
const SentryExceptionCaptured: () => MethodDecorator = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@sentry/nestjs').SentryExceptionCaptured;
  } catch {
    return () => () => undefined;
  }
})();

@Catch()
export class AllCatchExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllCatchExceptionFilter.name);

  @SentryExceptionCaptured()
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let uiMessage: UiMessages;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const payload = exception.getResponse() as { uiMessage?: UiMessages };
      uiMessage = payload.uiMessage ?? (exception.message as UiMessages);
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      uiMessage = UiMessages.INTERNAL_SERVER_ERROR;
    }

    if (statusCode < HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.warn(exception);
    } else {
      this.logger.error(exception);
    }

    response.status(statusCode).json({
      statusCode,
      message: uiMessage,
    });
  }
}
