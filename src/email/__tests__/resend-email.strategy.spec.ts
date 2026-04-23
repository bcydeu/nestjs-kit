const sendMock = jest.fn();
const batchSendMock = jest.fn();
const ResendCtorMock = jest.fn().mockImplementation(() => ({
  emails: { send: sendMock },
  batch: { send: batchSendMock },
}));

jest.mock('resend', () => ({ Resend: ResendCtorMock }));

import { ResendEmailStrategy } from '../strategy/resend-email.strategy';
import { EmailPayload } from '../email.type';

describe('ResendEmailStrategy', () => {
  let strategy: ResendEmailStrategy;

  beforeEach(() => {
    jest.clearAllMocks();
    strategy = new ResendEmailStrategy({
      apiKey: 'test-api-key',
      from: 'default@example.com',
    });
  });

  it('Resend 인스턴스를 주입받은 apiKey로 생성한다', () => {
    expect(ResendCtorMock).toHaveBeenCalledWith('test-api-key');
  });

  it('send: payload.from이 없으면 기본 from 값을 사용한다', async () => {
    const payload: EmailPayload = {
      to: ['a@example.com'],
      subject: 'hi',
      html: '<p>hi</p>',
    };
    await strategy.send(payload);

    expect(sendMock).toHaveBeenCalledWith({
      from: 'default@example.com',
      to: ['a@example.com'],
      subject: 'hi',
      html: '<p>hi</p>',
    });
  });

  it('send: payload.from이 있으면 그 값을 우선한다', async () => {
    await strategy.send({
      from: 'custom@example.com',
      to: ['a@example.com'],
      subject: 'hi',
      html: '<p>hi</p>',
    });

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({ from: 'custom@example.com' }),
    );
  });

  it('send 중 에러 발생 시 InternalServerErrorException을 던진다', async () => {
    sendMock.mockRejectedValueOnce(new Error('upstream boom'));

    await expect(
      strategy.send({
        to: ['a@example.com'],
        subject: 'hi',
        html: '<p>hi</p>',
      }),
    ).rejects.toThrow('Failed to send email via Resend API');
  });

  it('sendBatch: 여러 payload를 단일 배치로 전달한다', async () => {
    const payloads: EmailPayload[] = [
      { to: ['a@example.com'], subject: 's1', html: '<p>1</p>' },
      { to: ['b@example.com'], subject: 's2', html: '<p>2</p>' },
    ];
    await strategy.sendBatch(payloads);

    expect(batchSendMock).toHaveBeenCalledTimes(1);
    const [firstArg] = batchSendMock.mock.calls[0];
    expect(firstArg).toHaveLength(2);
    expect(firstArg[0].from).toBe('default@example.com');
  });
});
