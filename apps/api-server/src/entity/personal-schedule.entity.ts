import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Table } from './table.entity';

@Entity()
export class PersonalSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '코스 아이디' })
  @Column()
  courseId: string;

  @ApiProperty({ description: '시간표 제목' })
  @Column()
  table: string;

  @ApiProperty({ description: '시간표 프론트엔드를 위한 색션 객체' })
  @Column('json')
  sections: {
    [key: string]: {
      days: number[];
      startTimes: string[];
      endTimes: string[];
      locations: string[];
    };
  };

  @ManyToOne(() => Table, (table) => table.personalSubjects)
  tableEntity: Table;
}
