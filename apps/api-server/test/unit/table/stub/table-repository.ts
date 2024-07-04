import { Table } from '../../../../src/entity/table.entity';

export class StubTableRepository {
  tables = [];

  create(table: Partial<Table>): Table {
    return { ...table, id: 'table-id' } as Table;
  }

  save(table: Table): Promise<Table> {
    this.tables.push(table);
    return Promise.resolve(table);
  }

  findOne(conditions: any): Promise<Table> {
    return Promise.resolve(
      this.tables.find((table) => table.id === conditions.where.id),
    );
  }

  findOneBy(conditions: any): Promise<Table> {
    return Promise.resolve(
      this.tables.find((table) => table.id === conditions.id),
    );
  }

  async update(id: string, newTable: Partial<Table>): Promise<any> {
    const index = this.tables.findIndex((table) => table.id === id);
    if (index >= 0) {
      this.tables[index] = { ...this.tables[index], ...newTable };
      return this.tables[index];
    }
    return Promise.reject(new Error('Table not found'));
  }

  async remove(table: Table): Promise<Table> {
    const index = this.tables.findIndex((t) => t.id === table.id);
    if (index >= 0) {
      this.tables.splice(index, 1);
      return table;
    }
    return Promise.reject(new Error('Table not found'));
  }
}
