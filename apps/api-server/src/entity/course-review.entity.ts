import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { IsEnum, IsOptional } from 'class-validator';
import { Course } from './course.entity';

@Entity()
export class CourseReview {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @ApiProperty({ description: '수업을 들었던 학기' })
  @Column()
  semester: string;

  @ApiProperty({ description: '수업을 들었던 교수님' })
  @Column()
  instructor: string;

  @ApiProperty({ description: '수업 성적(선택)' })
  @IsOptional()
  @Column()
  myLetterGrade: string;

  @ApiProperty({ description: '팀플 유무' })
  @Column()
  teamProjectPresence: boolean;

  @ApiProperty({ description: '퀴즈 유무' })
  @Column()
  quizPresence: boolean;

  @ApiProperty({ description: '시험 횟수' })
  @Column()
  testQuantity: string;

  @ApiProperty({ description: '시험 종류' })
  @Column()
  testType: string;

  @ApiProperty({ description: '학점을 유하게 주는 정도' })
  @Column()
  generosity: string;

  @ApiProperty({ description: '출석을 체크하는 방식' })
  @Column()
  attendance: string;

  @ApiProperty({ description: '과제량' })
  @IsEnum(['many', 'soso', 'few'])
  @Column()
  homeworkQuantity: string;

  @ApiProperty({ description: '수업의 전체적인 난이도' })
  @IsEnum(['difficult', 'soso', 'easy'])
  @Column()
  difficulty: string;

  @ApiProperty({ description: '수업 평점 1~5' })
  @Column()
  overallGrade: number;

  @ApiProperty({ description: '수업 총평' })
  @Column()
  overallEvaluation: string;

  @ApiProperty({ description: '수강평 익명 여부' })
  @Column()
  anonymity: boolean = true;

  @ApiProperty({ description: '생성일' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '수정일' })
  @UpdateDateColumn()
  updateAt: Date;

  @ApiProperty({ description: '수업' })
  @ManyToOne(() => Course, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @ApiProperty({ description: '유저정보' })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
