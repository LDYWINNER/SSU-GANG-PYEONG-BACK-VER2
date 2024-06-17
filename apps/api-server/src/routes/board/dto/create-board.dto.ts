import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBoardDto {
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
    description: '조회 수',
    required: true,
    default: 0,
  })
  views: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '카테고리',
    required: true,
    example: '자유게시판',
  })
  category: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '익명 여부',
    required: true,
  })
  anonymity: boolean;
}
