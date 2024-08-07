import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  UpdateDateColumn,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';
import { CourseReview } from './course-review.entity';
import { CourseReviewReactionType } from '../common/enum/course-review-reaction.enum';
import { CourseReviewReactionTypeValues } from '../common/enum/course-review-reaction.enum';

@Entity('course_review_likes')
@Index(['fk_course_review_id', 'fk_user_id'], { unique: true })
export class CourseReviewLike {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  fk_user_id!: string;

  @Column('uuid')
  fk_course_review_id!: string;

  @Column({
    type: 'enum',
    enum: CourseReviewReactionTypeValues,
    default: CourseReviewReactionType.Like.text,
  })
  reaction!: string;

  @Index()
  @Column('timestampz')
  @CreateDateColumn()
  created_at!: Date;

  @Column('timestamptz')
  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => CourseReview, {
    onDelete: 'CASCADE',
    cascade: true,
    eager: true,
  })
  @JoinColumn({ name: 'fk_course_review_id' })
  course_review!: CourseReview;

  @ManyToOne(() => User, { cascade: true, eager: true })
  @JoinColumn({ name: 'fk_user_id' })
  user!: User;
}
