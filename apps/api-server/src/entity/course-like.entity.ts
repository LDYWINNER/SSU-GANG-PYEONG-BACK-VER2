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
import { Course } from './course.entity';

@Entity('course_likes')
@Index(['fk_course_id', 'fk_user_id'], { unique: true })
export class CourseLike {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  fk_user_id!: string;

  @Column('uuid')
  fk_course_id!: string;

  @Index()
  @Column('timestampz')
  @CreateDateColumn()
  created_at!: Date;

  @Column('timestamptz')
  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => Course, { cascade: true, eager: true })
  @JoinColumn({ name: 'fk_course_id' })
  course!: Course;

  @ManyToOne(() => User, { cascade: true, eager: true })
  @JoinColumn({ name: 'fk_user_id' })
  user!: User;
}
