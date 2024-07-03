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
import { IsNotEmpty } from 'class-validator';
import { PersonalSchedule } from './personal-schedule.entity';
import { SchoolSchedule } from './school-schedule.entity';

@Entity()
export class Table {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '시간표 이름(학기 또는 유저 설정 이름)' })
  @IsNotEmpty()
  @Column()
  title: string;

  @ApiProperty({
    description: '유저 시간표 항목들(학교 정규 수업)',
  })
  @OneToMany(() => SchoolSchedule, (schoolSchedule) => schoolSchedule.id, {
    nullable: true,
    cascade: true,
  })
  schoolSubjects: SchoolSchedule[];

  @ApiProperty({
    description: '유저 시간표 항목들(개인 스케줄)',
  })
  @OneToMany(
    () => PersonalSchedule,
    (personalSchedule) => personalSchedule.id,
    { nullable: true, cascade: true },
  )
  personalSubjects: PersonalSchedule[];

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
