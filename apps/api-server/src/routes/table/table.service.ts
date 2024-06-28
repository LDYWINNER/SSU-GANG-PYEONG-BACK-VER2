import { Injectable } from '@nestjs/common';

@Injectable()
export class TableService {
  constructor() {}

  createTable = async (userId: string, tableName: string) => {};

  updateTable = async (tableId: string, newTable: any) => {};

  deleteTable = async (tableId: string) => {};
}
