import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtUserGuard } from '../jwt-user.guard';
import { JwtUserStrategy } from '../jwt-user.strategy';
import { SecurityModule } from '../security.module';
import { JWT_USER_OPTIONS, JwtUserOptions } from '../security.tokens';

describe('SecurityModule.forRootAsync', () => {
  it('DynamicModule을 global로 반환한다', () => {
    const mod = SecurityModule.forRootAsync({
      useFactory: () => ({ secret: 'x' }),
    });

    expect(mod.module).toBe(SecurityModule);
    expect(mod.global).toBe(true);
    expect(mod.exports).toEqual(
      expect.arrayContaining([JwtUserStrategy, JwtUserGuard]),
    );
  });

  it('factory 결과가 JWT_USER_OPTIONS로 주입되고 JwtModule도 구성된다', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [
            () => ({ jwt: { secret: 'test-secret', expiresIn: '1h' } }),
          ],
          isGlobal: true,
          ignoreEnvFile: true,
        }),
        SecurityModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (config: unknown): JwtUserOptions => {
            const c = config as ConfigService;
            return {
              secret: c.getOrThrow<string>('jwt.secret'),
              expiresIn: c.getOrThrow<string>('jwt.expiresIn'),
            };
          },
        }),
      ],
    }).compile();

    const resolvedOptions = module.get<JwtUserOptions>(JWT_USER_OPTIONS);
    expect(resolvedOptions.secret).toBe('test-secret');
    expect(resolvedOptions.expiresIn).toBe('1h');

    const jwt = module.get(JwtService);
    const token = jwt.sign({ sub: 1 });
    expect(typeof token).toBe('string');
    const decoded = jwt.verify<{ sub: number }>(token);
    expect(decoded.sub).toBe(1);

    await module.close();
  });

  it('expiresIn이 없으면 signOptions 없이 동작한다', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SecurityModule.forRootAsync({
          useFactory: () => ({ secret: 'only-secret' }),
        }),
      ],
    }).compile();

    const jwt = module.get(JwtService);
    const token = jwt.sign({ sub: 42 });
    expect(jwt.verify<{ sub: number }>(token).sub).toBe(42);

    await module.close();
  });
});
