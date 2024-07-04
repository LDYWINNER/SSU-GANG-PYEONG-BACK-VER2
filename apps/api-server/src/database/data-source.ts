import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import {
  Initialization1720085948305,
  SchoolSchedule1720101120123,
} from './migrations';

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT || '5434'),
  database: process.env.POSTGRES_DB || 'postgres',
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  entities: ['apps/api-server/src/entity/*.entity{.ts,.js}'],
  migrations: [Initialization1720085948305, SchoolSchedule1720101120123],
  migrationsTableName: 'migrations',
};

export const dataSource = new DataSource(options);
