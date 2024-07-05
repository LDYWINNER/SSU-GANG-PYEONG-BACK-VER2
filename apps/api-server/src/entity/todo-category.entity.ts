import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ToDoTask } from './todo-task.entity';

export class ToDoCategoryColor {
  id: string;
  name: string;
  code: string;
}

export class ToDoCategoryIcon {
  id: string;
  name: string;
  symbol: string;
}

@Entity()
export class ToDoCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '투두 카테고리 제목' })
  @IsNotEmpty()
  @Column()
  name: string;

  @ApiProperty({ description: '투두 카테고리 수정 가능 여부' })
  @IsNotEmpty()
  @Column({ default: true })
  isEditable: boolean;

  @ApiProperty({
    description: '투두 카테고리에 속한 투두 테스크 목록',
  })
  @OneToMany(() => ToDoTask, (toDoTask) => toDoTask.id, {
    nullable: true,
    cascade: true,
  })
  toDoTasks: ToDoTask[];

  @ApiProperty({ description: '투두 카테고리 색상 정보' })
  @ValidateNested()
  @Type(() => ToDoCategoryColor)
  @Column({ type: 'simple-json' })
  color: ToDoCategoryColor;

  @ApiProperty({ description: '투두 카테고리 아이콘 정보' })
  @ValidateNested()
  @Type(() => ToDoCategoryIcon)
  @Column({ type: 'simple-json' })
  icon: ToDoCategoryIcon;

  @ApiProperty({ description: '생성일' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '수정일' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: '유저 정보' })
  @ManyToOne(() => User, (user) => user.tables, { onDelete: 'CASCADE' })
  user: User;
}
