import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Board } from './board.entity';
import { RefreshToken } from './refresh-token.entity';
import { Role } from '../common/enum/user.enum';

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

  @Column({ type: 'enum', enum: Role, default: Role.User })
  role: Role = Role.User;

  @ApiProperty({ description: '작성한 게시글' })
  @OneToMany(() => Board, (board) => board.user)
  boards?: Board[];

  @Column({ select: false, nullable: true, insert: false, update: false })
  boardCount?: number;

  @OneToOne(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshToken: RefreshToken;
}
