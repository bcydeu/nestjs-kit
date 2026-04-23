import { NumberValidator } from '../..';
import { validateSync } from 'class-validator';

class TestDTO {
  @NumberValidator({
    integer: true,
    message: '정수여야 합니다.',
  })
  integerProp!: number;

  @NumberValidator({
    optional: true,
    positive: true,
    message: '양수여야 합니다.',
  })
  positiveProp!: number;

  @NumberValidator({
    optional: true,
    min: 5,
    max: 10,
    message: '숫자는 5~10 사이여야 합니다.',
  })
  minProp!: number;
}

describe('NumberValidator Unit Test', () => {
  it('정수가 아닌 경우 에러 확인', () => {
    // given
    const dto = Object.assign(new TestDTO(), { integerProp: 2.2 });

    // when
    const errors = validateSync(dto);

    // then
    expect(errors).toHaveLength(1);
    expect(errors.at(0)).toMatchObject({
      property: 'integerProp',
      constraints: {
        isInt: '정수여야 합니다.',
      },
    });
  });

  it('양수가 아닌 경우 에러 확인', () => {
    // given
    const dto = Object.assign(new TestDTO(), {
      integerProp: 3,
      positiveProp: -1,
    });

    // when
    const errors = validateSync(dto);

    // then
    expect(errors).toHaveLength(1);
    expect(errors.at(0)).toMatchObject({
      property: 'positiveProp',
      constraints: {
        min: '양수여야 합니다.',
      },
    });
  });

  it('최소, 최대 에러 확인', () => {
    // given
    const dto = Object.assign(new TestDTO(), { integerProp: 2, minProp: 1 });

    // when
    const errors = validateSync(dto);

    // then
    expect(errors).toHaveLength(1);
    expect(errors.at(0)).toMatchObject({
      property: 'minProp',
      constraints: {
        min: '숫자는 5~10 사이여야 합니다.',
      },
    });
  });
});
