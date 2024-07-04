import { Module } from '@nestjs/common';
import { TableController } from './table.controller';
import { TableService } from './table.service';
import { SchoolScheduleController } from './school-schedule/school-schedule.controller';
import { SchoolScheduleService } from './school-schedule/school-schedule.service';
import { PersonalScheduleController } from './personal-schedule/personal-schedule.controller';
import { PersonalScheduleService } from './personal-schedule/personal-schedule.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Table, User, PersonalSchedule, SchoolSchedule } from '../../entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Table, PersonalSchedule, SchoolSchedule, User]),
  ],
  controllers: [
    TableController,
    SchoolScheduleController,
    PersonalScheduleController,
  ],
  providers: [TableService, SchoolScheduleService, PersonalScheduleService],
})
export class TableModule {}
