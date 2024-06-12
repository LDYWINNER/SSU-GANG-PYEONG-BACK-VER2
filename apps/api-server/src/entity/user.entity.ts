import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Board } from './board.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '유저아이디', example: 'admin' })
  @Column({ unique: true })
  username: string;

  @ApiProperty({ description: '유저 이메일', example: 'admin@stonybrook.edu' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: '비밀번호' })
  @Column({ select: false })
  password: string;

  @ApiProperty({ description: '작성한 게시글' })
  @OneToMany(() => Board, (board) => board.user)
  boards?: Board[];

  @Column({ select: false, nullable: true, insert: false, update: false })
  boardCount?: number;
}
