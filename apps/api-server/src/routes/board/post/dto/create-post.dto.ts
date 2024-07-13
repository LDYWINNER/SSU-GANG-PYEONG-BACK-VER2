import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '제목',
    required: true,
    example: '안녕하세요',
  })
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '내용',
    required: true,
    example: '안녕하세요',
  })
  contents: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '게시판 id',
    required: true,
  })
  boardId: string;

  @IsNotEmpty()
  @ApiProperty({
    description: '익명 여부',
    required: true,
  })
  anonymity: boolean;
}
