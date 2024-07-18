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
import { BoardPost } from './board-post.entity';

@Entity('board_post_likes')
@Index(['fk_board_post_id', 'fk_user_id'], { unique: true })
export class BoardPostLike {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  fk_user_id!: string;

  @Column('uuid')
  fk_board_post_id!: string;

  @Index()
  @Column('timestampz')
  @CreateDateColumn()
  created_at!: Date;

  @Column('timestamptz')
  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => BoardPost, {
    onDelete: 'CASCADE',
    cascade: true,
    eager: true,
  })
  @JoinColumn({ name: 'fk_board_post_id' })
  board_post!: BoardPost;

  @ManyToOne(() => User, { cascade: true, eager: true })
  @JoinColumn({ name: 'fk_user_id' })
  user!: User;
}
