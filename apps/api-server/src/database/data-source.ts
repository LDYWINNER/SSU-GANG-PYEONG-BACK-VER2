import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import {
  SsuGangPyeongReference1719681701078,
  TablePersonalSchedule1719813960356,
  TableSchoolSchedule1719894904035,
} from './migrations';

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT || '5434'),
  database: process.env.POSTGRES_DB || 'postgres',
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  entities: ['apps/api-server/src/**/*.entity{.ts,.js}'],
  migrations: [
    SsuGangPyeongReference1719681701078,
    TablePersonalSchedule1719813960356,
    TableSchoolSchedule1719894904035,
  ],
  migrationsTableName: 'migrations',
};

export const dataSource = new DataSource(options);
