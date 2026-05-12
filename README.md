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
import { EmailModule, ResendEmailStrategy } from '@yunhak/nestjs-kit/email';

@Module({
  imports: [
    EmailModule.forRootAsync({
      useFactory: () => ({
        strategy: new ResendEmailStrategy({ apiKey: process.env.RESEND_API_KEY! }),
      }),
    }),
  ],
})
export class AppModule {}
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
