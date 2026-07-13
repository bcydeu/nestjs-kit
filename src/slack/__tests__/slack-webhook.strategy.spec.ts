import { SlackWebhookStrategy } from '../strategy/slack-webhook.strategy';
import { SlackHttpClient } from '../slack.client';
import { SlackWebhookOptions } from '../slack.tokens';

// strategy는 HTTP poster를 주입받으므로, 모킹 없이 stub 객체만 넣으면 된다.
describe('SlackWebhookStrategy', () => {
  const postMock = vi.fn();
  const stubHttp: SlackHttpClient = { post: postMock };

  const build = (options: SlackWebhookOptions) => new SlackWebhookStrategy(options, stubHttp);
  const ok = { ok: true, status: 200, text: async () => '' };

  beforeEach(() => {
    vi.clearAllMocks();
    postMock.mockResolvedValue(ok);
  });

  it('설정된 webhookUrl로 POST하고 text를 그대로 전달한다', async () => {
    await build({ webhookUrl: 'https://hooks.slack.com/services/x' }).send({ text: 'hello' });

    expect(postMock).toHaveBeenCalledTimes(1);
    const [url, body] = postMock.mock.calls[0];
    expect(url).toBe('https://hooks.slack.com/services/x');
    expect(body).toMatchObject({ text: 'hello' });
  });

  it('message에 username/iconEmoji가 없으면 옵션의 기본값을 icon_emoji로 매핑한다', async () => {
    await build({
      webhookUrl: 'https://hooks.slack.com/services/x',
      username: 'bot',
      iconEmoji: ':rocket:',
    }).send({ text: 'hi' });

    const [, body] = postMock.mock.calls[0];
    expect(body).toMatchObject({ username: 'bot', icon_emoji: ':rocket:' });
  });

  it('message의 username/iconEmoji가 기본값보다 우선한다', async () => {
    await build({
      webhookUrl: 'https://hooks.slack.com/services/x',
      username: 'default',
      iconEmoji: ':a:',
    }).send({ text: 'hi', username: 'custom', iconEmoji: ':b:' });

    const [, body] = postMock.mock.calls[0];
    expect(body).toMatchObject({ username: 'custom', icon_emoji: ':b:' });
  });

  it('blocks/channel을 페이로드로 전달한다', async () => {
    const blocks = [{ type: 'section' }];
    await build({ webhookUrl: 'https://hooks.slack.com/services/x' }).send({
      text: 'fallback',
      blocks,
      channel: '#alerts',
    });

    const [, body] = postMock.mock.calls[0];
    expect(body).toMatchObject({ blocks, channel: '#alerts' });
  });

  it('응답이 ok=false면 InternalServerErrorException을 던진다', async () => {
    postMock.mockResolvedValueOnce({ ok: false, status: 400, text: async () => 'invalid_payload' });

    await expect(
      build({ webhookUrl: 'https://hooks.slack.com/services/x' }).send({ text: 'hi' }),
    ).rejects.toThrow('Failed to send message via Slack webhook');
  });

  it('전송 중 에러 발생 시 InternalServerErrorException을 던진다', async () => {
    postMock.mockRejectedValueOnce(new Error('network boom'));

    await expect(
      build({ webhookUrl: 'https://hooks.slack.com/services/x' }).send({ text: 'hi' }),
    ).rejects.toThrow('Failed to send message via Slack webhook');
  });

  describe('notify', () => {
    it('한줄 텍스트를 그대로 전송한다', async () => {
      await build({ webhookUrl: 'https://hooks.slack.com/services/x' }).notify('배포 완료');

      const [, body] = postMock.mock.calls[0];
      expect(body).toMatchObject({ text: '배포 완료' });
    });
  });

  describe('sendError', () => {
    const strategy = () => build({ webhookUrl: 'https://hooks.slack.com/services/x' });

    // 전송된 페이로드에서 헤더 text와 attachment(color/text)를 뽑아낸다.
    const captured = () => {
      const body = postMock.mock.calls[0][1] as {
        text: string;
        attachments: { color: string; text: string }[];
      };
      return { header: body.text, attachment: body.attachments[0] };
    };

    it('헤더에 이모지·제목, attachment에 메시지·스택 코드블록을 담는다', async () => {
      await strategy().sendError(new TypeError('boom'));

      const { header, attachment } = captured();
      expect(header).toContain(':rotating_light:');
      expect(header).toContain('*TypeError*');
      expect(attachment.text).toContain('boom');
      expect(attachment.text).toContain('```');
    });

    it('level 기본값 error는 danger color를 쓴다', async () => {
      await strategy().sendError(new Error('x'));
      expect(captured().attachment.color).toBe('danger');
    });

    it('level=warn이면 warning color와 경고 이모지를 쓴다', async () => {
      await strategy().sendError(new Error('x'), { level: 'warn' });

      const { header, attachment } = captured();
      expect(attachment.color).toBe('warning');
      expect(header).toContain(':warning:');
    });

    it('level=fatal이면 진한 빨강 hex를 쓴다', async () => {
      await strategy().sendError(new Error('x'), { level: 'fatal' });
      expect(captured().attachment.color).toBe('#8b0000');
    });

    it('environment 옵션이 있으면 헤더에 [env]를 표시한다', async () => {
      await build({
        webhookUrl: 'https://hooks.slack.com/services/x',
        environment: 'production',
      }).sendError(new Error('x'));

      expect(captured().header).toContain('*[production]*');
    });

    it('title 옵션이 error.name보다 우선한다', async () => {
      await strategy().sendError(new Error('x'), { title: '결제 실패' });
      expect(captured().header).toContain('*결제 실패*');
    });

    it('context를 key-value 목록으로 첨부한다', async () => {
      await strategy().sendError(new Error('x'), {
        context: { path: '/pay', userId: 42 },
      });

      const { attachment } = captured();
      expect(attachment.text).toContain('*path*: /pay');
      expect(attachment.text).toContain('*userId*: 42');
    });

    it('Error가 아닌 값도 문자열로 감싸 전송한다', async () => {
      await strategy().sendError('그냥 문자열');
      expect(captured().attachment.text).toContain('그냥 문자열');
    });

    it('channel 옵션을 페이로드로 전달한다', async () => {
      await strategy().sendError(new Error('x'), { channel: '#alerts' });
      expect(postMock.mock.calls[0][1]).toMatchObject({ channel: '#alerts' });
    });

    it('긴 스택은 잘라서 전송한다', async () => {
      const err = new Error('big');
      err.stack = 'x'.repeat(5000);
      await strategy().sendError(err);

      const { attachment } = captured();
      expect(attachment.text).toContain('… (truncated)');
      expect(attachment.text.length).toBeLessThan(5000);
    });
  });
});
