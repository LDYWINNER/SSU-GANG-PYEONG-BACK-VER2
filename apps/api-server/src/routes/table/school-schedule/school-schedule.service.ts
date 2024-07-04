import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolSchedule } from '../../../entity/school-schedule.entity';
import { Table } from '../../../entity/table.entity';
import { CreateSchoolScheduleDto } from './dto/create-school-schedule.dto';

@Injectable()
export class SchoolScheduleService {
  constructor(
    @InjectRepository(SchoolSchedule)
    private schoolScheduleRepository: Repository<SchoolSchedule>,
    @InjectRepository(Table)
    private tableRepository: Repository<Table>,
  ) {}

  async createSchoolSchedule(createSchoolScheduleDto: CreateSchoolScheduleDto) {
    const table = await this.tableRepository.findOneBy({
      id: createSchoolScheduleDto.tableId,
    });
    if (!table) {
      throw new NotFoundException(
        `Table with id ${createSchoolScheduleDto.tableId} not found`,
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { tableId, ...rest } = createSchoolScheduleDto;
    const createdSchoolSchedule = this.schoolScheduleRepository.create({
      tableEntity: table,
      ...rest,
    });

    return this.schoolScheduleRepository.save(createdSchoolSchedule);
  }

  async deleteSchoolSchedule(schoolScheduleId: string) {
    const schoolSchedule = await this.schoolScheduleRepository.findOneBy({
      id: schoolScheduleId,
    });
    if (!schoolSchedule) {
      throw new NotFoundException(
        `School Schedule with id ${schoolScheduleId} not found`,
      );
    }

    await this.schoolScheduleRepository.remove(schoolSchedule);
    return schoolSchedule;
  }

  async deleteAllSchoolSchedule(tableId: string) {
    const table = await this.tableRepository.findOneBy({
      id: tableId,
    });
    if (!table) {
      throw new NotFoundException(`Table with id ${tableId} not found`);
    }

    const schoolSchedules = await this.schoolScheduleRepository.find({
      where: { tableEntity: { id: tableId } },
    });

    const count = schoolSchedules.length;
    await this.schoolScheduleRepository.remove(schoolSchedules);

    return { count, items: schoolSchedules };
  }
}
