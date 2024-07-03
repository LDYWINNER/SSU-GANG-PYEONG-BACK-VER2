import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsObject } from 'class-validator';

export class CreatePersonalScheduleDto {
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

  @ApiProperty({ description: '시간표 프론트엔드를 위한 색션 객체' })
  @IsObject()
  @IsNotEmpty()
  sections: {
    [key: string]: {
      days: number[];
      startTimes: string[];
      endTimes: string[];
      locations: string[];
    };
  };
}
