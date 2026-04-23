import { Entity, Property } from '@mikro-orm/core';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { BaseEntity } from '../base.entity';

@Entity()
class Child extends BaseEntity {
  @Property()
  name!: string;
}

describe('BaseEntity', () => {
  describe('validators', () => {
    it('id는 positive 정수여야 한다', () => {
      const instance = plainToInstance(Child, {
        id: -1,
        createdAt: new Date(),
        name: 'foo',
      });

      const errors = validateSync(instance);
      const idError = errors.find(e => e.property === 'id');

      expect(idError?.constraints).toBeDefined();
    });

    it('createdAt는 Date 타입이어야 한다', () => {
      const instance = plainToInstance(Child, {
        id: 1,
        createdAt: 'not-a-date',
        name: 'foo',
      });

      const errors = validateSync(instance);
      const createdAtError = errors.find(e => e.property === 'createdAt');

      expect(createdAtError?.constraints).toBeDefined();
    });

    it('updatedAt는 optional이라 없어도 통과', () => {
      const instance = plainToInstance(Child, {
        id: 1,
        createdAt: new Date(),
        name: 'foo',
      });

      const errors = validateSync(instance);
      const updatedAtError = errors.find(e => e.property === 'updatedAt');

      expect(updatedAtError).toBeUndefined();
    });

    it('유효한 값은 에러 없음', () => {
      const instance = plainToInstance(Child, {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'foo',
      });

      const errors = validateSync(instance);
      // name은 @Property만 있고 class-validator 데코레이터가 없으므로 에러 없음
      expect(errors).toHaveLength(0);
    });
  });

  describe('class-transformer', () => {
    it('deletedAt는 Exclude 되어 직렬화 시 제외된다', () => {
      const child = new Child();
      child.id = 1;
      child.createdAt = new Date();
      child.deletedAt = new Date();

      const { classToPlain } = require('class-transformer');
      const plain = classToPlain(child);

      expect(plain).not.toHaveProperty('deletedAt');
    });
  });
});
