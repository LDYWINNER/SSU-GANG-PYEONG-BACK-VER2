import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonalSchedule } from '../../../entity/personal-schedule.entity';
import { CreatePersonalScheduleDto } from './dto/create-personal-schedule.dto';
import { UpdatePersonalScheduleDto } from './dto/update-personal-schedule.dto';
import { Table } from '../../../entity/table.entity';

@Injectable()
export class PersonalScheduleService {
  constructor(
    @InjectRepository(PersonalSchedule)
    private readonly personalScheduleRepository: Repository<PersonalSchedule>,
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
  ) {}

  createPersonalSchedule = async (
    tableId: string,
    createPersonalScheduleDto: CreatePersonalScheduleDto,
  ) => {
    const table = await this.tableRepository.findOne({
      where: { id: tableId },
    });
    if (!table) {
      throw new NotFoundException(`Table with ID ${tableId} not found`);
    }

    const newPersonalSchedule = this.personalScheduleRepository.create({
      tableEntity: table,
      table: table.title,
      ...createPersonalScheduleDto,
    });

    return this.personalScheduleRepository.save(newPersonalSchedule);
  };

  updatePersonalSchedule = async (
    personalScheduleId: string,
    newPersonalSchedule: UpdatePersonalScheduleDto,
  ) => {
    const personalSchedule = await this.personalScheduleRepository.findOne({
      where: { id: personalScheduleId },
    });
    if (!personalSchedule) {
      throw new NotFoundException(
        `PersonalSchedule with ID ${personalScheduleId} not found`,
      );
    }

    await this.personalScheduleRepository.update(personalScheduleId, {
      ...newPersonalSchedule,
    });

    return this.personalScheduleRepository.findOne({
      where: { id: personalScheduleId },
      relations: ['table'],
    });
  };

  deletePersonalSchedule = async (personalScheduleId: string) => {
    const personalSchedule = await this.personalScheduleRepository.findOne({
      where: { id: personalScheduleId },
    });
    if (!personalSchedule) {
      throw new NotFoundException(
        `PersonalSchedule with ID ${personalScheduleId} not found`,
      );
    }

    await this.personalScheduleRepository.remove(personalSchedule);

    return personalSchedule;
  };
}
