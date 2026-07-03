import type { PinoLogger } from 'nestjs-pino';
import { PinoAppLogger } from '../pino-app-logger';

// PinoLogger를 stub으로 주입해 위임/인자 순서만 검증한다(모킹 대신 DI+stub).
const makePinoStub = () => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  setContext: vi.fn(),
  assign: vi.fn(),
});

describe('PinoAppLogger', () => {
  it('info: (message, meta) → pino.info(meta, message)로 인자 순서를 뒤집어 위임한다', () => {
    const pino = makePinoStub();
    const logger = new PinoAppLogger(pino as unknown as PinoLogger);

    logger.info('주문 생성', { userId: 'u1' });

    expect(pino.info).toHaveBeenCalledWith({ userId: 'u1' }, '주문 생성');
  });

  it('meta가 없으면 빈 객체를 첫 인자로 넘긴다(pino는 obj-first 시그니처)', () => {
    const pino = makePinoStub();
    const logger = new PinoAppLogger(pino as unknown as PinoLogger);

    logger.info('메시지만');

    expect(pino.info).toHaveBeenCalledWith({}, '메시지만');
  });

  it('warn/error도 동일하게 위임한다', () => {
    const pino = makePinoStub();
    const logger = new PinoAppLogger(pino as unknown as PinoLogger);

    logger.warn('경고', { code: 1 });
    const err = new Error('boom');
    logger.error('실패', { err });

    expect(pino.warn).toHaveBeenCalledWith({ code: 1 }, '경고');
    expect(pino.error).toHaveBeenCalledWith({ err }, '실패');
  });

  it('setContext / assign은 그대로 위임한다', () => {
    const pino = makePinoStub();
    const logger = new PinoAppLogger(pino as unknown as PinoLogger);

    logger.setContext('OrderService');
    logger.assign({ tenantId: 't1' });

    expect(pino.setContext).toHaveBeenCalledWith('OrderService');
    expect(pino.assign).toHaveBeenCalledWith({ tenantId: 't1' });
  });
});
