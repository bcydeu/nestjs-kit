import {
  NestedValidator,
  NumberValidator,
  StringValidator,
} from '../..';
import { validateSync } from 'class-validator';

class NestedNumTestDTO {
  @NumberValidator({ min: 5 })
  num!: number;
}

class NestedStrTestDTO {
  @StringValidator({ optional: false })
  str!: string;

  @NestedValidator({ type: () => NestedNumTestDTO })
  num!: NestedNumTestDTO;
}

class TestDTO {
  @NestedValidator({ type: () => NestedStrTestDTO })
  nested: NestedStrTestDTO;
}

describe('NestedValidator Unit Test', () => {
  it('중첩 객체 에러 확인', () => {
    // given
    const numDto: NestedNumTestDTO = Object.assign(new NestedNumTestDTO(), {
      num: 3,
    });
    const strDto: NestedStrTestDTO = Object.assign(new NestedStrTestDTO(), {
      num: numDto,
    });
    const testDto: TestDTO = Object.assign(new TestDTO(), {
      nested: strDto,
    });

    // when
    const errors = validateSync(testDto);

    // then
    expect(errors).toHaveLength(1); // 최상위 객체에 에러가 1개
    const nestedError = errors[0];
    expect(nestedError.property).toBe('nested'); // 'nested' 프로퍼티에서 에러 발생
    expect(nestedError.children).toHaveLength(2); // 'nested' 내부에 2개의 에러

    const [strError, numError] = nestedError.children!;
    expect(strError.property).toBe('str'); // 'str' 필드에서 에러 발생
    expect(strError.constraints).toHaveProperty('isNotEmpty'); // 'isNotEmpty' 에러 확인

    expect(numError.property).toBe('num'); // 'num' 필드에서 에러 발생
    expect(numError.children).toHaveLength(1); // 'num' 내부에 1개의 에러

    const numChildError = numError.children![0];
    expect(numChildError.property).toBe('num'); // 최종적으로 'num' 필드에서 에러 발생
    expect(numChildError.constraints).toHaveProperty('min');
  });
});
