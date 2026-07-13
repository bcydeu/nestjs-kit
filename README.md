# @yunhak/nestjs-kit

NestJS 개인 프로젝트용 공용 인프라 키트.
1 패키지 + 7개 서브패스 export. 런타임 의존성 0개 (전부 peer).

## Install

```bash
npm install @yunhak/nestjs-kit
```

내부적으로 NestJS 11 / Node 20 이상 기준. 사용하는 서브패스에 맞춰 peer를 직접 설치한다.

## Subpaths

| Subpath                       | 설명                                                                | 추가 peer (필수)                                                   |
| ----------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `@yunhak/nestjs-kit/common`   | validators, filters, interceptors, errors, decorators, pipes, utils | `@nestjs/swagger`, `class-validator`, `class-transformer`          |
| `@yunhak/nestjs-kit/security` | `JwtUserGuard`, `JwtUserStrategy`, `@PublicApi()`, `SecurityModule` | `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`      |
| `@yunhak/nestjs-kit/config`   | options DTO + `createConfigValidator`                               | `@nestjs/config`                                                   |
| `@yunhak/nestjs-kit/email`    | `EmailModule.forRootAsync` + Resend 전략                            | optional: `resend`                                                 |
| `@yunhak/nestjs-kit/slack`    | `SlackModule.forRootAsync` + Incoming Webhook 전략                  | 없음 (전역 `fetch`, Node 22+)                                      |
| `@yunhak/nestjs-kit/logging`  | `SentryLoggerModule` (lazy Sentry loader)                           | optional: `@sentry/nestjs`                                         |
| `@yunhak/nestjs-kit/orm`      | `BaseEntity`, `getRootAsyncOptions`                                 | `@mikro-orm/core`, `@mikro-orm/nestjs`, `@mikro-orm/postgresql` 등 |

## Usage

### `/security` — JWT 가드 + PublicApi

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
```

```ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { SecurityModule, JwtUserGuard, PublicApi } from '@yunhak/nestjs-kit/security';

@Module({
  imports: [
    SecurityModule.forRootAsync({
      useFactory: () => ({ secret: process.env.JWT_SECRET! }),
    }),
  ],
  providers: [{ provide: APP_GUARD, useClass: JwtUserGuard }],
})
export class AppModule {}

// PublicApi 데코레이터로 인증 우회
@PublicApi()
@Get('/health')
health() { return 'ok'; }
```

### `/email` — Resend 전략

```bash
npm install resend
```

```ts
import { Module } from '@nestjs/common';
import { EmailModule } from '@yunhak/nestjs-kit/email';

@Module({
  imports: [
    EmailModule.forRootAsync({
      useFactory: () => ({
        apiKey: process.env.RESEND_API_KEY!,
        from: process.env.EMAIL_FROM!,
      }),
    }),
  ],
})
export class AppModule {}
```

```ts
import { Inject, Injectable } from '@nestjs/common';
import { EMAIL_CLIENT, EmailService } from '@yunhak/nestjs-kit/email';

@Injectable()
export class ReportService {
  constructor(@Inject(EMAIL_CLIENT) private readonly email: EmailService) {}

  async send() {
    await this.email.send({
      to: ['user@example.com'],
      subject: '리포트',
      html: '<p>본문</p>',
    });
  }
}
```

### `/slack` — Incoming Webhook 전략

peer 없이 전역 `fetch`로 동작한다(Node 22+). Slack에서 발급한 Incoming Webhook URL만 있으면 된다.

```ts
import { Module } from '@nestjs/common';
import { SlackModule } from '@yunhak/nestjs-kit/slack';

@Module({
  imports: [
    SlackModule.forRootAsync({
      useFactory: () => ({
        webhookUrl: process.env.SLACK_WEBHOOK_URL!,
        environment: process.env.NODE_ENV, // 선택: 에러 알림 헤더에 [env] 표시
        username: 'ci-bot', // 선택: 기본 표시 이름
        iconEmoji: ':rocket:', // 선택: 기본 아이콘
      }),
    }),
  ],
})
export class AppModule {}
```

```ts
import { Inject, Injectable } from '@nestjs/common';
import { SLACK_CLIENT, SlackService } from '@yunhak/nestjs-kit/slack';

@Injectable()
export class AlertService {
  constructor(@Inject(SLACK_CLIENT) private readonly slack: SlackService) {}

  // 한줄 알림
  async ping() {
    await this.slack.notify('배포 완료 :tada:');
  }

  // 에러 알림 — 레벨(color 바)·제목·스택·컨텍스트를 포매팅해 전송
  async onError(err: unknown) {
    await this.slack.sendError(err, {
      level: 'error', // 'warn' | 'error' | 'fatal' — attachment color 바로 심각도 표현
      title: '결제 처리 실패',
      context: { path: '/pay', userId: 42 },
    });
  }

  // 저수준 — blocks/channel 등 직접 제어
  async rich() {
    await this.slack.send({ text: 'fallback', blocks: [{ type: 'section' }], channel: '#alerts' });
  }
}
```

### `/logging` — Sentry 로거

```bash
npm install @sentry/nestjs
```

```ts
import { SentryLoggerModule } from '@yunhak/nestjs-kit/logging';

@Module({
  imports: [
    SentryLoggerModule.forRootAsync({
      useFactory: () => ({ dsn: process.env.SENTRY_DSN }),
    }),
  ],
})
export class AppModule {}
```

### `/orm` — MikroORM 헬퍼

```bash
npm install @mikro-orm/core @mikro-orm/nestjs @mikro-orm/postgresql
```

```ts
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { getRootAsyncOptions } from '@yunhak/nestjs-kit/orm';

@Module({
  imports: [
    MikroOrmModule.forRootAsync(
      getRootAsyncOptions({
        /* ... */
      }),
    ),
  ],
})
export class AppModule {}
```

### `/config` — env 검증

```ts
import { createConfigValidator, JwtOptions } from '@yunhak/nestjs-kit/config';

export const validate = createConfigValidator(JwtOptions /* + 다른 옵션 클래스 */);
```

### `/common` — 공용 데코레이터/필터/파이프

```ts
import {
  AllCatchExceptionFilter,
  ResponseInterceptor,
  AppException,
  IsOptionalString,
} from '@yunhak/nestjs-kit/common';
```

## Dev

```bash
npm install
npm run typecheck     # tsc --noEmit
npm test              # jest
npm run lint          # eslint (변경 파일은 commit hook에서 자동 처리됨)
npm run format:check  # prettier --check
npm run build         # tsc (CJS + d.ts)
```

## Release

[changesets](https://github.com/changesets/changesets) 기반.

```bash
npx changeset           # 변경사항 기록
git commit -am "feat: ..."
# main 머지 → GitHub Action이 release PR 자동 생성 → merge 시 npm publish
```

## License

MIT
