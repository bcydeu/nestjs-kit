import {
  ArrayValidator,
  BooleanValidator,
  DateValidator,
  NestedValidator,
  NumberValidator,
  StringValidator,
} from '../..';
import { validateSync } from 'class-validator';

describe('ArrayValidatorDecorator Unit Test', () => {
  it('최소 배열 길이 확인', () => {
    // given
    class TestArrayDTO {
      @ArrayValidator({ minItems: 3 })
      arr!: unknown[];
    }
    const dto = Object.assign(new TestArrayDTO(), {
      arr: [1, 'str'],
    });

    // when
    const errors = validateSync(dto);

    // then
    expect(errors).toHaveLength(1);
    expect(errors.at(0)).toMatchObject({
      property: 'arr',
      constraints: {
        arrayMinSize: `arr must contain at least 3 items`,
      },
    });
  });

  it('최대 배열 길이 확인', () => {
    // given
    class TestArrayDTO {
      @ArrayValidator({ maxItems: 3 })
      arr!: unknown[];
    }
    const dto = Object.assign(new TestArrayDTO(), {
      arr: [1, 'str', true, {}],
    });

    // when
    const errors = validateSync(dto);

    // then
    expect(errors).toHaveLength(1);
    expect(errors.at(0)).toMatchObject({
      property: 'arr',
      constraints: {
        arrayMaxSize: `arr must contain no more than 3 items`,
      },
    });
  });

  it('optional 옵션 확인', () => {
    // given
    class TestArrayDTO {
      @ArrayValidator({ optional: true })
      arr?: unknown[];
    }

    const dto = Object.assign(new TestArrayDTO(), { arr: null });

    // when
    const errors = validateSync(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('각 요소 validator 적용 확인', () => {
    it('StringValidator 적용 확인', () => {
      // given
      class TestArrayDTO {
        @ArrayValidator(
          {},
          {
            decorator: StringValidator,
            options: {
              maxLength: 10,
              message: '최대 문자열의 길이는 10자리입니다.',
            },
          },
        )
        arr!: string[];
      }

      const dto = Object.assign(new TestArrayDTO(), {
        arr: ['최대 문자열의 길이는 10자리 테스트.'],
      });

      // when
      const errors = validateSync(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors.at(0)).toMatchObject({
        property: 'arr',
        constraints: {
          isLength: '최대 문자열의 길이는 10자리입니다.',
        },
      });
    });

    it('NumberValidator 적용 확인', () => {
      // given
      class TestArrayDTO {
        @ArrayValidator(
          {},
          {
            decorator: NumberValidator,
            options: { positive: true },
          },
        )
        arr!: number[];
      }
      const dto = Object.assign(new TestArrayDTO(), { arr: [-1] });

      // when
      const errors = validateSync(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors.at(0)).toMatchObject({
        property: 'arr',
        constraints: {
          min: `arr each elements must be a positive number`,
        },
      });
    });

    it('BooleanValidator 적용 확인', () => {
      // given
      class TestArrayDTO {
        @ArrayValidator(
          {},
          {
            decorator: BooleanValidator,
            options: { message: '각 요소는 boolean이어야 합니다.' },
          },
        )
        arr!: boolean[];
      }
      const dto = Object.assign(new TestArrayDTO(), { arr: [1] });

      // when
      const errors = validateSync(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors.at(0)).toMatchObject({
        property: 'arr',
        constraints: {
          isBoolean: '각 요소는 boolean이어야 합니다.',
        },
      });
    });

    it('DateValidator 적용 확인', () => {
      // given
      class TestArrayDTO {
        @ArrayValidator(
          {},
          {
            decorator: DateValidator,
            options: { message: '각 요소는 날짜이어야 합니다.' },
          },
        )
        arr!: Date[];
      }
      const dto = Object.assign(new TestArrayDTO(), { arr: ['2021-01-01'] });

      // when
      const errors = validateSync(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors.at(0)).toMatchObject({
        property: 'arr',
        constraints: {
          isDate: '각 요소는 날짜이어야 합니다.',
        },
      });
    });

    it('NestedValidator 적용 확인', () => {
      // given
      class NestedDTO {
        @StringValidator({ maxLength: 10 })
        str!: string;
      }

      class TestArrayDTO {
        @ArrayValidator(
          {},
          {
            decorator: NestedValidator,
            options: { type: () => NestedDTO },
          },
        )
        arr!: NestedDTO[];
      }

      const strDto = Object.assign(new NestedDTO(), {
        str: '이 문자열은 너무 깁니다.',
      });
      const dto = Object.assign(new TestArrayDTO(), {
        arr: Array.of(strDto),
      });

      // when
      const errors = validateSync(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors.toString()).toContain(
        'property arr[0].str has failed the following constraints: isLength',
      );
    });
  });
});
