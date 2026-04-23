import {
  ConsoleLogger,
  Inject,
  Injectable,
  Optional,
  Scope,
} from '@nestjs/common';
import { loadSentry } from './sentry.loader';
import {
  DEFAULT_IGNORED_CONTEXTS,
  SENTRY_LOGGER_OPTIONS,
  SentryLoggerOptions,
} from './sentry-logger.tokens';

@Injectable({ scope: Scope.TRANSIENT })
export class SentryLoggerService extends ConsoleLogger {
  private readonly ignoredContexts: Set<string>;
  private readonly isProductionFn: () => boolean;
  private readonly sentry = loadSentry();

  constructor(
    @Optional()
    @Inject(SENTRY_LOGGER_OPTIONS)
    options?: SentryLoggerOptions,
  ) {
    super();
    this.ignoredContexts = new Set(
      options?.ignoredContexts ?? DEFAULT_IGNORED_CONTEXTS,
    );
    this.isProductionFn =
      options?.isProduction ?? (() => process.env.NODE_ENV === 'production');
  }

  private get isProduction(): boolean {
    return this.isProductionFn();
  }

  log(message: any, ...optionalParams: any[]) {
    super.log(message, ...optionalParams);

    if (!this.isProduction || this.shouldIgnore(message, optionalParams)) {
      return;
    }

    const logContext = typeof message === 'object' ? message : { message };
    const extraContext = optionalParams.length
      ? { args: optionalParams }
      : {};

    if (this.sentry.logger) {
      this.sentry.logger.info(
        typeof message === 'string' ? message : JSON.stringify(message),
        {
          ...logContext,
          ...extraContext,
          logger: 'SentryLogger',
          context: this.getContextName(optionalParams),
        },
      );
    }
  }

  error(message: any, stack?: string, context?: string) {
    super.error(message, stack, context);

    if (!this.isProduction) {
      return;
    }

    if (this.sentry.logger) {
      this.sentry.logger.error(String(message), {
        stack,
        context,
        logger: 'SentryLogger',
      });
    }

    this.sentry.addBreadcrumb({
      category: 'error',
      message: String(message),
      level: 'error',
      data: { stack, context },
    });
  }

  warn(message: any, ...optionalParams: any[]) {
    super.warn(message, ...optionalParams);

    if (!this.isProduction || this.shouldIgnore(message, optionalParams)) {
      return;
    }

    if (this.sentry.logger) {
      this.sentry.logger.warn(String(message), {
        context: this.getContextName(optionalParams),
        logger: 'SentryLogger',
      });
    }
  }

  private getContextName(args: any[]): string {
    if (args.length > 0 && typeof args[args.length - 1] === 'string') {
      return args[args.length - 1];
    }
    return 'Unknown';
  }

  private shouldIgnore(message: any, params?: any[]): boolean {
    const context = this.getContextName(params || []);
    if (this.ignoredContexts.has(context)) {
      return true;
    }

    const msgStr = String(message);
    if (msgStr.includes('/health') || msgStr.includes('Health Check')) {
      return true;
    }

    return false;
  }
}
