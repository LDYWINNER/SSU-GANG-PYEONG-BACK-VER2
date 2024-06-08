import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateBoardDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'The name of a post',
    required: true,
    example: 'Title',
  })
  name: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'The content of a post',
    required: true,
    example: 'Contents',
  })
  contents: string;
}
