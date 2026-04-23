import { ApiProperty } from '@nestjs/swagger';

/**
 * 성공 응답 DTO
 * 모든 성공적인 API 응답은 이 형식을 따릅니다.
 */
export class SuccessResponseDto<T = any> {
  @ApiProperty({
    description: '응답 상태',
    example: 'success',
    enum: ['success'],
  })
  status: 'success';

  @ApiProperty({
    description: '응답 데이터',
  })
  data: T;
}

/**
 * 에러 응답 DTO
 * 모든 에러 응답은 이 형식을 따릅니다.
 */
export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP 상태 코드',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: '에러 메시지 (사용자에게 표시 가능)',
    example: '잘못된 요청입니다.',
  })
  message: string;
}

/**
 * 페이지네이션 메타 정보
 */
export class PaginationMetaDto {
  @ApiProperty({
    description: '현재 페이지 번호',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: '페이지당 항목 수',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: '전체 항목 수',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: '전체 페이지 수',
    example: 10,
  })
  totalPages: number;

  @ApiProperty({
    description: '다음 페이지 존재 여부',
    example: true,
  })
  hasNext: boolean;

  @ApiProperty({
    description: '이전 페이지 존재 여부',
    example: false,
  })
  hasPrevious: boolean;
}

/**
 * 페이지네이션 응답 DTO
 */
export class PaginatedResponseDto<T = any> {
  @ApiProperty({
    description: '응답 상태',
    example: 'success',
    enum: ['success'],
  })
  status: 'success';

  @ApiProperty({
    description: '응답 데이터 배열',
    isArray: true,
  })
  data: T[];

  @ApiProperty({
    description: '페이지네이션 메타 정보',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;
}
