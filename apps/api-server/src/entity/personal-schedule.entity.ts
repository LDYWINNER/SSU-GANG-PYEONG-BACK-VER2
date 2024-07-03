import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Table } from './table.entity';

@Entity()
export class PersonalSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description:
      '개인 스케줄의 제목을 뜻하지만 시간표의 프론트엔드 구현 패키지 특성 상 courseId 라는 속성을 사용',
  })
  @Column()
  courseId: string;

  @ApiProperty({ description: '시간표 제목' })
  @Column()
  tableTitle: string;

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

  @ManyToOne(() => Table, (table) => table.personalSubjects, {
    onDelete: 'CASCADE',
  })
  tableEntity: Table;
}
