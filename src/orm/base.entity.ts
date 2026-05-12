import { DateValidator, NumberValidator } from '../common';
import { Entity, Filter, PrimaryKey, Property } from '@mikro-orm/core';
import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Entity({ abstract: true })
@Filter({
  name: 'softDelete',
  cond: () => ({ deletedAt: null }),
  args: false,
  default: true,
})
export class BaseEntity {
  @ApiProperty({
    description: 'Entity ID',
    type: Number,
    example: 1,
  })
  @NumberValidator({ positive: true })
  @PrimaryKey({ type: 'number', autoincrement: true })
  @Expose()
  id!: number;

  @ApiProperty({
    description: '생성일',
    type: Date,
    example: new Date(2025, 1, 1),
  })
  @DateValidator()
  @Property({
    type: 'timestamptz',
    onCreate: () => new Date(),
  })
  @Expose()
  createdAt!: Date;

  @ApiPropertyOptional({
    description: '수정일',
    type: Date,
    nullable: true,
    example: new Date(2025, 1, 1),
  })
  @DateValidator({ optional: true })
  @Property({
    type: 'timestamptz',
    onUpdate: () => new Date(),
    nullable: true,
  })
  @Expose()
  updatedAt?: Date;

  @ApiHideProperty()
  @Property({
    type: 'timestamptz',
    nullable: true,
  })
  @Exclude()
  deletedAt?: Date;
}
