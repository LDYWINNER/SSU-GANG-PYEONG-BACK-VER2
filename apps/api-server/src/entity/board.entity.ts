import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { BoardPost } from './board-post.entity';
import { BoardType } from '../common/enum/board.enum';

const BoardTypeTransformer = {
  to: (boardType: BoardType): string => boardType.text,
  from: (text: string): BoardType => BoardType.valueOf(text),
};

@Entity()
export class Board {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '게시판 이름' })
  @Column()
  title: string;

  @ApiProperty({ description: '게시판 설명' })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({ description: '게시판 유형' })
  @Column({ type: 'varchar', transformer: BoardTypeTransformer })
  boardType: BoardType = BoardType.All;

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

  @ApiProperty({ description: '게시판 댓글' })
  @OneToMany(() => BoardPost, (post) => post.board, { cascade: true })
  posts?: BoardPost[];
}
