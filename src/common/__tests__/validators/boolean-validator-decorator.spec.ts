import { BooleanValidator } from '../..';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

class TestDto {
  @BooleanValidator()
  value: boolean;
}

describe('BooleanValidator', () => {
  describe('성공 케이스', () => {
    it.each([true, 'true'])(
      '값이 %s인 경우 true를 반환해야 한다.',
      async (value: string | boolean) => {
        // given
        const dto = plainToInstance(TestDto, { value });

        // when
        const errors = await validate(dto);

        // then
        expect(errors.length).toBe(0);
      },
    );

    it.each([false, 'false'])(
      '값이 %s인 경우 false를 반환해야 한다.',
      async (value: string | boolean) => {
        // given
        const dto = plainToInstance(TestDto, { value });

        // when
        const errors = await validate(dto);

        // then
        expect(errors.length).toBe(0);
      },
    );
  });

  describe('실패 케이스', () => {
    it.each([123, 'foo', {}, []])(
      '값이 %s인 경우 실패해야 한다.',
      async (value: unknown) => {
        // given
        const dto = plainToInstance(TestDto, { value });

        // when
        const errors = await validate(dto);

        // then
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isBoolean');
      },
    );
  });
});
