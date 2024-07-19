import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RefreshToken } from './refresh-token.entity';
import { UserType, UserTypeValues } from '../common/enum/user.enum';
import { BoardPost } from './board-post.entity';
import { Table } from './table.entity';
import { ToDoCategory } from './todo-category.entity';
import { CourseReview } from './course-review.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ required: true, description: '유저 이름', example: 'admin' })
  @Column({ unique: true })
  username: string;

  @ApiProperty({
    required: true,
    description: '유저 이메일',
    example: 'admin@stonybrook.edu',
  })
  @Column({ unique: true, nullable: false })
  email: string;

  @ApiProperty({
    required: true,
    description: '비밀번호',
    example: 'Password1234*',
  })
  @Column({ select: false })
  password: string;

  @ApiProperty({ description: '작성한 게시글' })
  @Column({ type: 'enum', enum: UserTypeValues, default: UserType.User.text })
  role: string;

  @ApiProperty({ description: '시간표 테이블' })
  @OneToMany(() => Table, (table) => table.user, { cascade: true })
  tables?: Table[];

  @ApiProperty({ description: '유저가 생성한 투두 카테고리 목록' })
  @OneToMany(() => ToDoCategory, (toDoCategory) => toDoCategory.user, {
    cascade: true,
  })
  toDoCategories?: ToDoCategory[];

  @ApiProperty({ description: '유저가 생성한 투두 테스크 목록' })
  @OneToMany(() => ToDoCategory, (toDoCategory) => toDoCategory.user, {
    cascade: true,
  })
  toDoTasks?: ToDoCategory[];

  @ApiProperty({ description: '작성한 게시글' })
  @OneToMany(() => BoardPost, (boardPost) => boardPost.user, {
    cascade: true,
  })
  boardPosts?: BoardPost[];

  @ApiProperty({ description: '작성한 수강평' })
  @OneToMany(() => CourseReview, (courseReview) => courseReview.user, {
    cascade: true,
  })
  courseReviews?: CourseReview[];

  @Column({ default: 0 })
  postCount: number;

  @OneToOne(() => RefreshToken, (refreshToken) => refreshToken.user, {
    cascade: true,
  })
  refreshToken?: RefreshToken;

  @ApiProperty({ description: '생성일' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '수정일' })
  @UpdateDateColumn()
  updateAt: Date;
}
