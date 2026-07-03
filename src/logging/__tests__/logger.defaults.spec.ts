import { buildPinoParams } from '../logger.defaults';

const prettyOn = () => true;
const prettyOff = () => false;

// autoLogging.ignore / genReqId 콜백을 pinoHttp에서 꺼내기 위한 헬퍼.
type ReqLike = { url?: string; headers?: Record<string, string | string[] | undefined> };
type ResLike = { setHeader: (name: string, value: string) => void };
const getIgnore = (pinoHttp: Record<string, unknown>) =>
  (pinoHttp.autoLogging as { ignore: (req: ReqLike) => boolean }).ignore;
const getGenReqId = (pinoHttp: Record<string, unknown>) =>
  pinoHttp.genReqId as (req: ReqLike, res: ResLike) => string;

describe('buildPinoParams', () => {
  describe('level', () => {
    it('production이면 기본 info', () => {
      const { pinoHttp } = buildPinoParams({ isProduction: () => true }, prettyOn);
      expect(pinoHttp.level).toBe('info');
    });

    it('개발환경이면 기본 debug', () => {
      const { pinoHttp } = buildPinoParams({ isProduction: () => false }, prettyOff);
      expect(pinoHttp.level).toBe('debug');
    });

    it('명시한 level이 최우선', () => {
      const { pinoHttp } = buildPinoParams({ level: 'warn', isProduction: () => false }, prettyOff);
      expect(pinoHttp.level).toBe('warn');
    });
  });

  describe('pretty transport', () => {
    it('개발환경 + pino-pretty 있으면 transport 부착', () => {
      const { pinoHttp } = buildPinoParams({ isProduction: () => false }, prettyOn);
      expect(pinoHttp.transport).toEqual({
        target: 'pino-pretty',
        options: { singleLine: true },
      });
    });

    it('production이면 pretty 옵션과 무관하게 transport 없음', () => {
      const { pinoHttp } = buildPinoParams({ isProduction: () => true }, prettyOn);
      expect(pinoHttp.transport).toBeUndefined();
    });

    it('개발환경이라도 pino-pretty 미설치면 transport 없음', () => {
      const { pinoHttp } = buildPinoParams({ isProduction: () => false }, prettyOff);
      expect(pinoHttp.transport).toBeUndefined();
    });
  });

  describe('redact', () => {
    it('기본 민감정보 경로를 포함한다', () => {
      const { pinoHttp } = buildPinoParams({}, prettyOff);
      expect(pinoHttp.redact).toContain('req.headers.authorization');
      expect(pinoHttp.redact).toContain('req.headers.cookie');
    });

    it('사용자 지정 경로를 병합한다', () => {
      const { pinoHttp } = buildPinoParams({ redact: ['req.body.ssn'] }, prettyOff);
      expect(pinoHttp.redact).toContain('req.headers.authorization');
      expect(pinoHttp.redact).toContain('req.body.ssn');
    });
  });

  describe('autoLogging.ignore', () => {
    it('기본 /health 및 하위 경로를 무시한다', () => {
      const { pinoHttp } = buildPinoParams({}, prettyOff);
      const ignore = getIgnore(pinoHttp);
      expect(ignore({ url: '/health' })).toBe(true);
      expect(ignore({ url: '/health/live' })).toBe(true);
      expect(ignore({ url: '/users' })).toBe(false);
    });

    it('ignorePaths를 커스터마이즈할 수 있다', () => {
      const { pinoHttp } = buildPinoParams({ ignorePaths: ['/metrics'] }, prettyOff);
      const ignore = getIgnore(pinoHttp);
      expect(ignore({ url: '/metrics' })).toBe(true);
      expect(ignore({ url: '/health' })).toBe(false);
    });

    it('url이 없어도 안전하다', () => {
      const { pinoHttp } = buildPinoParams({}, prettyOff);
      expect(getIgnore(pinoHttp)({})).toBe(false);
    });
  });

  describe('genReqId', () => {
    it('인바운드 x-request-id를 존중하고 응답 헤더로 반향한다', () => {
      const { pinoHttp } = buildPinoParams({}, prettyOff);
      const setHeader = vi.fn();
      const id = getGenReqId(pinoHttp)({ headers: { 'x-request-id': 'abc-123' } }, { setHeader });
      expect(id).toBe('abc-123');
      expect(setHeader).toHaveBeenCalledWith('x-request-id', 'abc-123');
    });

    it('x-correlation-id도 인식한다', () => {
      const { pinoHttp } = buildPinoParams({}, prettyOff);
      const id = getGenReqId(pinoHttp)(
        { headers: { 'x-correlation-id': 'corr-1' } },
        { setHeader: vi.fn() },
      );
      expect(id).toBe('corr-1');
    });

    it('헤더가 없으면 생성하고 응답 헤더로 반향한다', () => {
      const { pinoHttp } = buildPinoParams({}, prettyOff);
      const setHeader = vi.fn();
      const id = getGenReqId(pinoHttp)({ headers: {} }, { setHeader });
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
      expect(setHeader).toHaveBeenCalledWith('x-request-id', id);
    });
  });

  describe('pinoHttp escape hatch', () => {
    it('같은 키를 사용자 지정값으로 덮어쓴다', () => {
      const { pinoHttp } = buildPinoParams(
        { level: 'info', isProduction: () => true, pinoHttp: { level: 'trace', customKey: 1 } },
        prettyOff,
      );
      expect(pinoHttp.level).toBe('trace');
      expect(pinoHttp.customKey).toBe(1);
    });
  });
});
