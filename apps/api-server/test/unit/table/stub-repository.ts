import { Table } from 'apps/api-server/src/entity/table.entity';

export class StubTableRepository {
  tables = [];

  create(table: Partial<Table>): Table {
    return { ...table, id: 'table-id' } as Table;
  }

  save(table: Table): Promise<Table> {
    this.tables.push(table);
    return Promise.resolve(table);
  }

  // 임시 구현
  findOne(conditions: any): Promise<Table> {
    return Promise.resolve(
      this.tables.find(
        (table) =>
          table.title === conditions.where.title &&
          table.user.id === conditions.where.user.id,
      ),
    );
  }

  delete(conditions: any): Promise<{ affected: number }> {
    const index = this.tables.findIndex(
      (table) =>
        table.title === conditions.title &&
        table.user.id === conditions.user.id,
    );
    if (index >= 0) {
      this.tables.splice(index, 1);
      return Promise.resolve({ affected: 1 });
    }
    return Promise.resolve({ affected: 0 });
  }
}
