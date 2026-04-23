import { convertToInstance } from '../..';
import { Exclude, Expose } from 'class-transformer';

describe('MapperUtil Unit Test', () => {
  describe('convertToInstance()', () => {
    class TestDTO {
      @Expose()
      foo!: string;

      @Expose()
      bar!: string;

      @Exclude()
      unknown!: string;

      unknown2!: string;
    }
    it('배열이 아닌 경우 instance 변환 확인', () => {
      // when
      const result = convertToInstance(TestDTO, {
        foo: 'foo',
        bar: 'bar',
        unknown: 'unknown',
        unknown2: 'unknown2',
        unknown3: 'unknows3',
      });

      // then
      expect(result).toBeInstanceOf(TestDTO);
      expect(result).toEqual({
        foo: 'foo',
        bar: 'bar',
        unknown: undefined,
        unknown2: undefined,
      });
    });

    it('배열인 경우 instance 변환 확인', () => {
      // given
      const dto = Array.from({ length: 2 }, (_, i) => ({
        foo: `foo${i}`,
        bar: `bar${i}`,
        unknown: `unknown${i}`,
      }));

      // when
      const result = convertToInstance(TestDTO, dto);

      // then
      expect(result).toHaveLength(2);
      expect(result).toEqual([
        { foo: 'foo0', bar: 'bar0', unknown: undefined },
        { foo: 'foo1', bar: 'bar1', unknown: undefined },
      ]);
    });
  });
});
