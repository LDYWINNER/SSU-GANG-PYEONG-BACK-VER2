import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { MaxLength } from 'class-validator';
import { Board } from './board.entity';
import { BoardComment } from './board-comment.entity';

@Entity()
export class BoardPost {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @ApiProperty({ description: '제목' })
  @MaxLength(50)
  @Column()
  title: string;

  @ApiProperty({ description: '내용' })
  @Column()
  contents: string;

  @ApiProperty({ description: '조회 수' })
  @Column({ default: 0 })
  views: number;

  @ApiProperty({ description: '익명 여부' })
  @Column({ default: true })
  anonymity: boolean;

  @ApiProperty({ description: '생성일' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '수정일' })
  @UpdateDateColumn()
  updateAt: Date;

  @ApiProperty({ description: '게시판 댓글' })
  @OneToMany(() => BoardComment, (comment) => comment.boardPost, {
    cascade: true,
  })
  comments?: BoardComment[];

  @ApiProperty({ description: '게시판' })
  @ManyToOne(() => Board, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'boardId' })
  board: Board;

  @Column({ default: 0 })
  likes: number;

  @ApiProperty({ description: '유저정보' })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
