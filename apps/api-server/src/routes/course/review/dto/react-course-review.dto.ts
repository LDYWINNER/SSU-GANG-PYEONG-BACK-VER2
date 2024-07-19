import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ReactCourseReviewDto {
  @ApiProperty({ description: 'db 수강평 고유 uuid' })
  @IsNotEmpty()
  courseReviewId: string;

  @ApiProperty({ description: '수업 리액션 타입' })
  @IsNotEmpty()
  reactionType: string;
}
