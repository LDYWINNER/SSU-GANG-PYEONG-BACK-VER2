import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateBoardDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: '작성자 아이디',
    required: true,
    example: 'b45b4438-23cb-4e90-85df-b41abfe1aa98',
  })
  userId: string;

  @IsNotEmpty()
  @ApiProperty({
    description: '내용',
    required: true,
    example: '안녕하세요',
  })
  contents: string;
}
