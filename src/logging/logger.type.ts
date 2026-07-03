export interface KitLoggerOptions {
  /** 로그 레벨. 기본값: env LOG_LEVEL ?? (production이면 'info', 아니면 'debug'). */
  level?: string;
  /** production 판정 함수. 기본값: () => process.env.NODE_ENV === 'production'. */
  isProduction?: () => boolean;
  /**
   * dev용 pino-pretty 컬러 출력 사용 여부. 기본값: !isProduction.
   * pino-pretty가 설치돼 있지 않으면 이 값과 무관하게 JSON으로 출력한다.
   */
  pretty?: boolean;
  /** 기본 민감정보 redact 경로에 추가로 병합할 pino redact 경로. */
  redact?: string[];
  /** 자동 요청 로깅(autoLogging)에서 제외할 요청 경로 prefix. 기본값: ['/health']. */
  ignorePaths?: string[];
  /**
   * nestjs-pino의 pinoHttp 옵션에 얕게 병합되는 escape hatch.
   * 위 옵션으로 부족할 때 raw pino-http 옵션을 직접 지정한다(같은 키는 이 값이 우선).
   */
  pinoHttp?: Record<string, unknown>;
}

export interface KitLoggerAsyncOptions {
  imports?: unknown[];
  inject?: unknown[];
  useFactory: (...args: unknown[]) => KitLoggerOptions | Promise<KitLoggerOptions>;
}
