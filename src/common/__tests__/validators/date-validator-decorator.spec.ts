import { DateValidator } from '../..';
import { validateSync } from 'class-validator';

describe('DateValidatorDecorator Unit Test', () => {
  it('날짜 에러 확인', () => {
    class TestDTO {
      @DateValidator()
      date!: Date;
    }
    // given
    const dto = Object.assign(new TestDTO(), { date: 'date' });

    // when
    const errors = validateSync(dto);

    // then
    expect(errors).toHaveLength(1);
    expect(errors.at(0)).toMatchObject({
      property: 'date',
      constraints: {
        isDate: `date must be a Date`,
      },
    });
  });
});
