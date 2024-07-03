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
import { Role } from '../common/enum/user.enum';
import { BoardPost } from './board-post.entity';
import { Table } from './table.entity';

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
  @Column({ type: 'enum', enum: Role, default: Role.User })
  role: Role = Role.User;

  @ApiProperty({ description: '시간표 테이블' })
  @OneToMany(() => Table, (table) => table.user, { onDelete: 'CASCADE' })
  tables?: Table[];

  @ApiProperty({ description: '작성한 게시글' })
  @OneToMany(() => BoardPost, (boardPost) => boardPost.user, {
    onDelete: 'CASCADE',
  })
  boardPosts?: BoardPost[];

  @Column({ select: false, nullable: true, insert: false, update: false })
  postCount: number;

  @OneToOne(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshToken?: RefreshToken;

  @ApiProperty({ description: '생성일' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '수정일' })
  @UpdateDateColumn()
  updateAt: Date;
}
