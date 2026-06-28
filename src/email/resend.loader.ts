// resend는 optional peer. 미설치 환경에서도 kit/email 서브패스를 import만 해도
// 되도록 require로 지연 로드한다. EmailModule만 이 함수를 호출하며, strategy는
// 생성된 클라이언트를 주입받으므로 테스트에서는 이 로더를 거치지 않는다.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ResendCtor = new (apiKey: string) => any;

export function loadResend(): ResendCtor {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('resend') as { Resend: ResendCtor };
    return mod.Resend;
  } catch {
    throw new Error(
      '`resend` 패키지가 설치되어 있지 않습니다. `npm install resend`로 설치 후 사용하세요.',
    );
  }
}
