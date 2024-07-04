import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSchoolScheduleDto {
  @ApiProperty({
    description: '시간표 고유 ID',
  })
  @IsString()
  @IsNotEmpty()
  tableId: string;

  @ApiProperty({
    description:
      '개인 스케줄의 제목을 뜻하지만 시간표의 프론트엔드 구현 패키지 특성 상 courseId 라는 속성을 사용',
  })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({
    description: '수업 시간, 요일, 장소 등이 복잡한 수업들의 분류를 위한 옵션',
  })
  @IsString()
  @IsOptional()
  complicatedCourseOption?: string;

  @ApiProperty({
    description: '요일을 선택할 수 있는 수업들의 분류를 위한 옵션',
  })
  @IsString()
  @IsOptional()
  twoOptionsDay?: string;

  @ApiProperty({
    description: '시간을 선택할 수 있는 수업들의 분류를 위한 옵션',
  })
  @IsString()
  @IsOptional()
  optionsTime?: string;
}
