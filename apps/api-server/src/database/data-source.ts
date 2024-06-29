import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { SsuGangPyeongReference1719681701078 } from './migrations/1719681701078-ssu-gang-pyeong-reference';

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT || '5434'),
  database: process.env.POSTGRES_DB || 'postgres',
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: [SsuGangPyeongReference1719681701078],
  migrationsTableName: 'migrations',
};

export const dataSource = new DataSource(options);
