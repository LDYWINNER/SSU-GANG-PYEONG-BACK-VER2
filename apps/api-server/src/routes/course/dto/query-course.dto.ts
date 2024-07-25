import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class QueryCourseDto {
  @ApiProperty({ description: '수업이 무슨 학과 소속인지: AMS, BUS, CSE, ...' })
  @IsOptional()
  subject?: string;

  @ApiProperty({ description: '검색 키워드' })
  @IsOptional()
  keyword?: string;
}
