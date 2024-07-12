import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '내용',
    required: true,
    example: '안녕하세요',
  })
  content: string;
}
