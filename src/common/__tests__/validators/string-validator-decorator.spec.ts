import { StringValidator } from '../..';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

enum TestEnum {
  AUTH = 'AUTH',
  USER = 'USER',
}

class TestDTO {
  @StringValidator({
    trim: true,
    minLength: 3,
    maxLength: 10,
    optional: false,
    message: '길이는 3~10자리 사이여야 합니다.',
  })
  prop!: string;

  @StringValidator({
    optional: false,
    enum: TestEnum,
    message: '"AUTH"와 "USER"만이 값으로 올 수 있습니다',
  })
  role!: TestEnum;
}

describe('StringValidator Unit Test', () => {
  it('앞 뒤 공백이 사라져야 한다.', () => {
    // given
    const dto: TestDTO = plainToInstance(TestDTO, {
      prop: ' fooo',
      role: 'AUTH',
    });

    // when
    const errors = validateSync(dto);

    // then
    expect(errors).toHaveLength(0);
    expect(dto.prop).toEqual('fooo');
  });

  it('길이가 잘못된 경우 에러 확인', () => {
    // given
    const dto: TestDTO = Object.assign(new TestDTO(), {
      prop: 'fo',
      role: 'USER',
    });

    // when
    const errors = validateSync(dto);

    // then
    expect(errors).toHaveLength(1);
    expect(errors.at(0)).toMatchObject({
      property: 'prop',
      constraints: {
        isLength: '길이는 3~10자리 사이여야 합니다.',
      },
    });
  });

  it('값이 비어있는 경우 에러 확인', () => {
    // given
    const dto: TestDTO = Object.assign(new TestDTO(), {
      prop: null,
      role: 'USER',
    });

    // when
    const errors = validateSync(dto);

    // then
    expect(errors).toHaveLength(1);
    expect(errors.at(0)).toMatchObject({
      property: 'prop',
      constraints: {
        isString: '길이는 3~10자리 사이여야 합니다.',
        isLength: '길이는 3~10자리 사이여야 합니다.',
      },
    });
  });

  it('enum에 해당하지 않는 경우 에러 확인', () => {
    // given
    const dto: TestDTO = Object.assign(new TestDTO(), {
      prop: 'fooo',
      role: 'ADMIN',
    });

    // when
    const errors = validateSync(dto);

    // then
    expect(errors).toHaveLength(1);
    expect(errors.at(0)).toMatchObject({
      property: 'role',
      constraints: {
        isIn: '"AUTH"와 "USER"만이 값으로 올 수 있습니다',
      },
    });
  });
});
