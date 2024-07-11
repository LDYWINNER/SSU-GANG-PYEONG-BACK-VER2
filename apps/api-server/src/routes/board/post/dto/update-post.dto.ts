import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '제목',
    required: true,
    example: '안녕하세요',
  })
  title?: string;

  @IsOptional()
  @ApiProperty({
    description: '내용',
    required: true,
    example: '내용입니다',
  })
  contents?: string;
}
