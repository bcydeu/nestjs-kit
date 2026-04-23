import { NestedValidator, NumberValidator, StringValidator } from '../../common';
import { createConfigValidator } from '../config.validator';

class DummyNested {
  @StringValidator()
  name: string;
}

class DummyDto {
  @StringValidator()
  appName: string;

  @NumberValidator({ integer: true, min: 1 })
  port: number;

  @NestedValidator({ type: () => DummyNested })
  nested: DummyNested;
}

const mapper = (env: Record<string, any>): DummyDto =>
  ({
    appName: env.APP_NAME,
    port: +env.PORT,
    nested: { name: env.NESTED_NAME },
  }) as DummyDto;

describe('createConfigValidator', () => {
  const validate = createConfigValidator(DummyDto, mapper);

  it('유효한 env는 그대로 통과시킨다', () => {
    const env = { APP_NAME: 'hagi-app', PORT: '3000', NESTED_NAME: 'inner' };
    const result = validate(env);

    expect(result).toBe(env); // 원본 그대로 반환
  });

  it('필수 값 누락 시 에러를 던진다', () => {
    const env = { APP_NAME: 'hagi-app' }; // PORT, NESTED_NAME 누락

    expect(() => validate(env)).toThrow(/config validation error/);
  });

  it('타입 변환 후에도 제약이 깨지면 에러를 던진다', () => {
    const env = { APP_NAME: 'hagi-app', PORT: '0', NESTED_NAME: 'inner' };

    expect(() => validate(env)).toThrow(/config validation error/);
  });

  it('NestedValidator가 하위 DTO까지 검사한다', () => {
    const env = { APP_NAME: 'hagi-app', PORT: '3000', NESTED_NAME: '' };

    expect(() => validate(env)).toThrow(/config validation error/);
  });
});
