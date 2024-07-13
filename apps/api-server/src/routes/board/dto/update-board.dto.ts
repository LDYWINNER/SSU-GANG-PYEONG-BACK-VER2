import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateBoardDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '게시판 제목',
    example: '자유 게시판',
  })
  title?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '게시판 설명',
    example: '자유롭게 아무 주제나 게시할 수 있는 게시판입니다',
  })
  description?: string;
}
