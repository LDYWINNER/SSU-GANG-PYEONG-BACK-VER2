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
import { BoardComment } from './board-comment.entity';

@Entity('board_comment_likes')
@Index(['fk_board_comment_id', 'fk_user_id'], { unique: true })
export class BoardCommentLike {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  fk_user_id!: string;

  @Column('uuid')
  fk_board_comment_id!: string;

  @Index()
  @Column('timestampz')
  @CreateDateColumn()
  created_at!: Date;

  @Column('timestamptz')
  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => BoardComment, { cascade: true, eager: true })
  @JoinColumn({ name: 'fk_board_comment_id' })
  board_comment!: BoardComment;

  @ManyToOne(() => User, { cascade: true, eager: true })
  @JoinColumn({ name: 'fk_user_id' })
  user!: User;
}
