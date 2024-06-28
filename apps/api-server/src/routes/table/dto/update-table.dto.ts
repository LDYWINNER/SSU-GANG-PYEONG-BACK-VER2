import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateTableDto {
  @IsNotEmpty()
  @ApiProperty({
    description: '시간표 제목',
    required: true,
    example: '2024-fall',
  })
  title: string;

  @IsNotEmpty()
  @ApiProperty({
    description: '유저 시간표 항목들(학교 정규 수업 + 개인 스케줄)',
    required: true,
    example: '["CSE 114", "CSE 214", "CSE 215", "CSE 216"]',
  })
  subjects: string[];
}
