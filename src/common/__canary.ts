import 'reflect-metadata';
import { IsEmail, IsInt, Min, ValidateNested, validateSync } from 'class-validator';
import { Type, plainToInstance } from 'class-transformer';

export class CanaryNested {
  @IsInt()
  @Min(1)
  port!: number;
}

export class CanaryRoot {
  @IsEmail()
  email!: string;

  @ValidateNested()
  @Type(() => CanaryNested)
  nested!: CanaryNested;
}

export function runCanary(): { okValid: boolean; okInvalid: boolean; okNested: boolean; details: unknown } {
  const validPayload = { email: 'user@example.com', nested: { port: 3000 } };
  const invalidPayload = { email: 'not-an-email', nested: { port: 0 } };

  const validInstance = plainToInstance(CanaryRoot, validPayload);
  const invalidInstance = plainToInstance(CanaryRoot, invalidPayload);

  const validErrors = validateSync(validInstance);
  const invalidErrors = validateSync(invalidInstance);

  const nestedError = invalidErrors.find(e => e.property === 'nested');
  const portError = nestedError?.children?.find(e => e.property === 'port');
  const okNested = !!portError?.constraints?.min;

  return {
    okValid: validErrors.length === 0,
    okInvalid: invalidErrors.length > 0,
    okNested,
    details: {
      validErrorCount: validErrors.length,
      invalidErrorCount: invalidErrors.length,
      invalidProperties: invalidErrors.map(e => e.property),
      portConstraints: portError?.constraints,
    },
  };
}
