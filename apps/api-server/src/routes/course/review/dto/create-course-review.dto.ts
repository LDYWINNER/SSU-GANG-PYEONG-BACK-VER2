import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCourseReviewDto {
  @ApiProperty({ description: 'db 수업 고유 uuid' })
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ description: '수업을 들었던 학기' })
  @IsNotEmpty()
  semester: string;

  @ApiProperty({ description: '수업을 들었던 교수님' })
  @IsNotEmpty()
  instructor: string;

  @ApiProperty({ description: '수업 성적(선택)' })
  @IsOptional()
  myLetterGrade: string;

  @ApiProperty({ description: '팀플 유무' })
  @IsNotEmpty()
  teamProjectPresence: boolean;

  @ApiProperty({ description: '퀴즈 유무' })
  @IsNotEmpty()
  quizPresence: boolean;

  @ApiProperty({ description: '시험 횟수' })
  @IsNotEmpty()
  testQuantity: string;

  @ApiProperty({ description: '시험 종류' })
  @IsNotEmpty()
  testType: string;

  @ApiProperty({ description: '학점을 유하게 주는 정도' })
  @IsNotEmpty()
  generosity: string;

  @ApiProperty({ description: '출석을 체크하는 방식' })
  @IsNotEmpty()
  attendance: string;

  @ApiProperty({ description: '과제량' })
  @IsEnum(['many', 'soso', 'few'])
  @IsNotEmpty()
  homeworkQuantity: string;

  @ApiProperty({ description: '수업의 전체적인 난이도' })
  @IsEnum(['difficult', 'soso', 'easy'])
  @IsNotEmpty()
  difficulty: string;

  @ApiProperty({ description: '수업 평점 1~5' })
  @IsNotEmpty()
  overallGrade: number;

  @ApiProperty({ description: '수업 총평' })
  @IsNotEmpty()
  overallEvaluation: string;

  @ApiProperty({ description: '수강평 익명 여부' })
  @IsNotEmpty()
  anonymity: boolean = true;
}
