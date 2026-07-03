import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { canResolvePinoPretty } from './pino.loader';
import type { KitLoggerOptions } from './logger.type';

// 요청/응답에 흔히 실려오는 민감정보. pino의 redact 경로 문법을 따른다.
const DEFAULT_REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["set-cookie"]',
  'res.headers["set-cookie"]',
  'req.body.password',
  'req.body.token',
  '*.password',
];

const DEFAULT_IGNORE_PATHS = ['/health'];

// KitLoggerOptions → nestjs-pino Params(pinoHttp)로 변환하는 순수 함수.
// loader/DI 없이 단위 테스트할 수 있도록 순수하게 유지한다.
// prettyAvailable은 pino-pretty 존재 여부 판정으로, 테스트에서 주입 가능하다.
export function buildPinoParams(
  options: KitLoggerOptions = {},
  prettyAvailable: () => boolean = canResolvePinoPretty,
): { pinoHttp: Record<string, unknown> } {
  const isProduction = (options.isProduction ?? (() => process.env.NODE_ENV === 'production'))();
  const level = options.level ?? process.env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug');
  const usePretty = (options.pretty ?? !isProduction) && prettyAvailable();
  const ignorePaths = options.ignorePaths ?? DEFAULT_IGNORE_PATHS;

  const pinoHttp: Record<string, unknown> = {
    level,
    redact: [...DEFAULT_REDACT_PATHS, ...(options.redact ?? [])],
    // 인바운드 x-request-id/x-correlation-id를 존중하고, 없으면 생성해 응답 헤더로 반향한다.
    genReqId: (req: IncomingMessage, res: ServerResponse) => {
      const headerId = req.headers['x-request-id'] ?? req.headers['x-correlation-id'];
      const id = (Array.isArray(headerId) ? headerId[0] : headerId) ?? randomUUID();
      res.setHeader('x-request-id', id);
      return id;
    },
    // 헬스체크 등은 요청 로그(autoLogging)에서 제외하되, 요청 컨텍스트는 유지한다.
    autoLogging: {
      ignore: (req: IncomingMessage) => ignorePaths.some((p) => (req.url ?? '').startsWith(p)),
    },
    ...(usePretty ? { transport: { target: 'pino-pretty', options: { singleLine: true } } } : {}),
    // escape hatch: 같은 키는 사용자 지정값이 우선한다.
    ...(options.pinoHttp ?? {}),
  };

  return { pinoHttp };
}
