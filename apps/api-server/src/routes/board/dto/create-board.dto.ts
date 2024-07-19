import { ApiProperty } from '@nestjs/swagger';
import { BoardType } from '../../../common/enum/board.enum';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBoardDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '게시판 제목',
    required: true,
    example: '자유 게시판',
  })
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '게시판 설명',
    required: true,
    example: '자유롭게 아무 주제나 게시할 수 있는 게시판입니다',
  })
  description: string;

  @IsNotEmpty()
  @ApiProperty({
    description: '게시판 유형',
    required: true,
    example: BoardType.All.text,
  })
  boardType: string = BoardType.All.text;
}
