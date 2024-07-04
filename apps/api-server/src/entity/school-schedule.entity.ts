import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Table } from './table.entity';
import { IsOptional } from 'class-validator';

@Entity()
export class SchoolSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: '수업 고유 ID',
  })
  @Column()
  courseId: string;

  @ApiProperty({ description: '시간표 제목' })
  @Column()
  tableTitle: string;

  @ApiProperty({
    description: '수업 시간, 요일, 장소 등이 복잡한 수업들의 분류를 위한 옵션',
  })
  @IsOptional()
  @Column({ nullable: true })
  complicatedCourseOption: string;

  @ApiProperty({
    description: '요일을 선택할 수 있는 수업들의 분류를 위한 옵션',
  })
  @IsOptional()
  @Column({ nullable: true })
  twoOptionsDay: string;

  @ApiProperty({
    description: '시간을 선택할 수 있는 수업들의 분류를 위한 옵션',
  })
  @IsOptional()
  @Column({ nullable: true })
  optionsTime: string;

  @ManyToOne(() => Table, (table) => table.personalSubjects, {
    onDelete: 'CASCADE',
  })
  tableEntity: Table;
}
