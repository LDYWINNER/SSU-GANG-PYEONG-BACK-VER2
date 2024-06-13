import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateBoardDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: '작성자 아이디',
    required: true,
    example: 'b45b4438-23cb-4e90-85df-b41abfe1aa98',
  })
  userId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '내용',
    required: true,
    example: '안녕하세요',
  })
  contents: string;
}
