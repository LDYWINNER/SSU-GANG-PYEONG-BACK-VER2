import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { CourseReview } from './course-review.entity';

@Entity()
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '유저들의 수업 평가에 따른 평균 점수' })
  @Column()
  avgGrade: number;

  @ApiProperty({ description: '코스 리스트의 수업 고유 id' })
  @Column()
  classNbr: string;

  @ApiProperty({ description: '수업 카테고리', example: 'AMS' })
  @Column()
  subj: string;

  @ApiProperty({ description: '수업 번호', example: '151' })
  @Column()
  crs: string;

  @ApiProperty({
    description: '수업 제목',
    example: 'Introduction to Object Oriented Programming',
  })
  @Column()
  courseTitle: string;

  @ApiProperty({
    description: '수업이 채워주는 졸업 요건 항목',
    example: 'ARTS',
  })
  @Column()
  sbc: string;

  @ApiProperty({ description: '수업/lab/recitation 구분', example: 'LEC' })
  @Column()
  cmp: string;

  @ApiProperty({ description: '수업 섹션', example: '90/91' })
  @Column()
  sctn: string;

  @ApiProperty({ description: '수업 학점', example: '3' })
  @Column()
  credits: string;

  @ApiProperty({ description: '수업 요일', example: 'MW' })
  @Column()
  day: string;

  @ApiProperty({ description: '수업 시작 시간', example: '10:30 AM' })
  @Column()
  startTime: string;

  @ApiProperty({ description: '수업 종료 시간', example: '11:50 AM' })
  @Column()
  endTime: string;

  @ApiProperty({
    description: '역대 수업을 담당한 교수님들 목록("instructor" from ver.1)',
    example: '["John Doe", "Jane Doe"]',
  })
  @Column('text', { array: true })
  past_instructors: string[];

  @ApiProperty({
    description:
      '최근 두 학기내에 해당 수업을 담당한 교수님들 목록("instructor_names" from ver.1)',
    example: '["John Doe", "Jane Doe"]',
  })
  @Column('text', { array: true })
  recent_two_instructors: string[];

  @ApiProperty({
    description:
      '제일 최근 학기에 해당 수업을 담당한 교수님("unique_instructor" from ver.1)',
    example: 'John Doe',
  })
  @Column()
  most_recent_instructor: string;

  @ApiProperty({
    description: '수업이 열렸던 학기 기록',
    example: '["2024_spring", ""2024_fall"]',
  })
  @Column('text', { array: true })
  semesters: string[];

  @ApiProperty({ description: '게시판 댓글' })
  @OneToMany(() => CourseReview, (courseReview) => courseReview.id, {
    cascade: true,
  })
  reviews: CourseReview[];
}
