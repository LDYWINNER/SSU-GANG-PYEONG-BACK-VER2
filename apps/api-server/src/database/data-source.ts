import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT || '5434'),
  database: process.env.POSTGRES_DATABASE || 'postgres',
  username: process.env.POSTGRES_USERNAME || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  entities: ['apps/api-server/src/**/*.entity{.ts,.js}'],
  migrations: ['apps/api-server/src/database/migrations/{.ts,.js}'],
  migrationsTableName: 'migrations',

  seeds: ['apps/api-server/src/database/seeds/**/*{.ts,.js}'],
  factories: ['apps/api-server/src/database/factories/**/*{.ts,.js}'],
};

export const dataSource = new DataSource(options);
