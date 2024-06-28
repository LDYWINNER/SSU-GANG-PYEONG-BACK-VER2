import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePostDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '제목',
    required: true,
    example: '안녕하세요',
  })
  title: string;

  @IsNotEmpty()
  @ApiProperty({
    description: '내용',
    required: true,
    example: '내용입니다',
  })
  contents: string;
}
