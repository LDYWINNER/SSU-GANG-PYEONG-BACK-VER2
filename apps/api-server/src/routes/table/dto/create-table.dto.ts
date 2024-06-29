import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateTableDto {
  @IsNotEmpty()
  @ApiProperty({
    description: '시간표 제목',
    required: true,
    example: '2024-fall',
  })
  name: string;
}
