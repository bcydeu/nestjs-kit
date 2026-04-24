# @yunhak/nestjs-kit

NestJS 개인 프로젝트용 공용 인프라 키트. 1 meta 패키지 + 6개 서브패스 export.

> 🚧 초기 스캐폴드 단계. 코드 이식은 Phase 2에서 진행.

## Subpaths

| Subpath | 내용 |
|---|---|
| `@yunhak/nestjs-kit/common` | validators, filters, errors, decorators, pipes, utils |
| `@yunhak/nestjs-kit/security` | JwtUserGuard, JwtUserStrategy, `@PublicApi()`, SecurityModule |
| `@yunhak/nestjs-kit/config` | options 타입 (jwt, orm, sentry, throttle, resend) + `createConfigValidator` |
| `@yunhak/nestjs-kit/email` | EmailModule, Resend strategy |
| `@yunhak/nestjs-kit/logging` | SentryLoggerModule |
| `@yunhak/nestjs-kit/orm` | BaseEntity, MikroORM helper, pool monitor |

## Dev

```bash
npm install
npm run build       # tsup
npm run typecheck   # tsc --noEmit
npm test            # jest
```

## License

MIT
