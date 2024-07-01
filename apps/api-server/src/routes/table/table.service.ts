import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Table } from '../../entity/table.entity';
import { User } from '../../entity/user.entity';
import { Repository } from 'typeorm';
import { UpdateTableDto } from './dto/update-table.dto';
import { CreateTableDto } from './dto/create-table.dto';

@Injectable()
export class TableService {
  constructor(
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  createTable = async (userId: string, { title }: CreateTableDto) => {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const newTable = this.tableRepository.create({
      title,
      subjects: [],
      user,
    });
    const savedTable = await this.tableRepository.save(newTable);
    return { ...savedTable };
  };

  updateTable = async (tableId: string, newTable: UpdateTableDto) => {
    const table = await this.tableRepository.findOne({
      where: { id: tableId },
    });
    if (!table) {
      throw new NotFoundException('Table not found');
    }

    await this.tableRepository.update(tableId, {
      ...newTable,
    });

    return this.tableRepository.findOne({
      where: { id: tableId },
      relations: ['user'],
    });
  };

  deleteTable = async (tableId: string) => {
    const table = await this.tableRepository.findOne({
      where: { id: tableId },
      relations: ['user'],
    });
    if (!table) {
      throw new NotFoundException('Table not found');
    }

    await this.tableRepository.remove(table);

    return table;
  };
}
