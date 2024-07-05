import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';
import { IsNotEmpty } from 'class-validator';
import { ToDoCategory } from './todo-category.entity';

@Entity()
export class ToDoTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '투두 테스크 제목' })
  @IsNotEmpty()
  @Column()
  name: string;

  @ApiProperty({ description: '투두 테스크 완료 여부' })
  @IsNotEmpty()
  @Column({ default: true })
  isCompleted: boolean;

  @ApiProperty({ description: '생성일' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '수정일' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ToDoCategory, (toDoCategory) => toDoCategory.toDoTasks, {
    onDelete: 'CASCADE',
  })
  toDoCategory: ToDoCategory;

  @ApiProperty({ description: '코스 Subj (ex: AMS, ACC, ...)' })
  @IsNotEmpty()
  @Column({ default: '' })
  categorySubj: string;

  @ApiProperty({
    description:
      '투두 테스크 날짜 조작용 속성 - 어느 날 완료해야 되는 테스크인지를 뜻함',
  })
  @IsNotEmpty()
  @Column()
  completeDate: string;

  @ApiProperty({ description: '유저 정보' })
  @ManyToOne(() => User, (user) => user.tables, { onDelete: 'CASCADE' })
  user: User;
}
