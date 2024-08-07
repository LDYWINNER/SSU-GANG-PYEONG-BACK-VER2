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
import { BoardPost } from './board-post.entity';

@Entity()
export class BoardComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '댓글 내용' })
  @Column()
  content: string;

  @ApiProperty({ description: '생성일' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '수정일' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: '유저 정보' })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ default: 0 })
  likes: number;

  @ApiProperty({ description: '게시글' })
  @ManyToOne(() => BoardPost, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'boardPostId' })
  boardPost: BoardPost;
}
