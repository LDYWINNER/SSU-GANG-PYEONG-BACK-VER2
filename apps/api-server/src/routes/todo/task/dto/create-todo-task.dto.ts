import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateToDoTaskDto {
  @ApiProperty({
    description: 'Todo Category 고유 ID',
  })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ description: '투두 테스크 제목' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '투두 테스크 완료 여부' })
  @IsNotEmpty()
  isCompleted: boolean;

  @ApiProperty({ description: '코스 Subj (ex: AMS, ACC, ...)' })
  @IsNotEmpty()
  categorySubj: string;

  @ApiProperty({
    description:
      '투두 테스크 날짜 조작용 속성 - 어느 날 완료해야 되는 테스크인지를 뜻함',
    example: '2024-07-07T16:45:38.913Z',
  })
  @IsNotEmpty()
  completeDate: string;
}
