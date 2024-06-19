import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { SeederOptions } from 'typeorm-extension';

config({ path: '.env.local' });

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['apps/api-server/src/**/*.entity{.ts,.js}'],
  migrations: ['apps/api-server/src/database/migrations/*.ts'],
  migrationsTableName: 'migrations',

  seeds: ['apps/api-server/src/database/seeds/**/*{.ts,.js}'],
  factories: ['apps/api-server/src/database/factories/**/*{.ts,.js}'],
};

export const dataSource = new DataSource(options);
