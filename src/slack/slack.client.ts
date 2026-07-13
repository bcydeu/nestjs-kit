export interface SlackHttpResponse {
  ok: boolean;
  status: number;
  text(): Promise<string>;
}

export interface SlackHttpClient {
  post(url: string, body: unknown): Promise<SlackHttpResponse>;
}

// webhook은 외부 SDK 없이 전역 fetch(Node 22+)로 POST한다. 이 파일만 fetch를
// 직접 참조하며, strategy는 SlackHttpClient를 주입받으므로 테스트에서는 이 팩토리를
// 거치지 않고 stub 객체로 대체된다.
export function createFetchSlackClient(): SlackHttpClient {
  return {
    async post(url: string, body: unknown): Promise<SlackHttpResponse> {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return { ok: res.ok, status: res.status, text: () => res.text() };
    },
  };
}
