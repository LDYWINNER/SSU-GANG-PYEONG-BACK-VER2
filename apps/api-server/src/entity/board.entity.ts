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

@Entity()
export class Board {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @ApiProperty({ description: '제목' })
  @Column()
  title: string;

  @ApiProperty({ description: '내용' })
  @Column()
  contents: string;

  @ApiProperty({ description: '조회 수' })
  @Column({ default: 0 })
  views: number;

  @ApiProperty({ description: '게시판 카테고리' })
  @Column()
  category: string;

  @ApiProperty({ description: '익명 여부' })
  @Column({ default: true })
  anonymity: boolean;

  @ApiProperty({ description: '생성일' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '수정일' })
  @UpdateDateColumn()
  updateAt: Date;

  @ApiProperty({ description: '유저정보' })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
