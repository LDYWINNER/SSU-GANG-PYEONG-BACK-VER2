import { DataSource, DataSourceOptions } from 'typeorm';

const options: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT || '5434'),
  database: process.env.POSTGRES_DB || 'postgres',
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/database/migrations/*.ts'],
  migrationsTableName: 'migrations',
};

export const dataSource = new DataSource(options);
