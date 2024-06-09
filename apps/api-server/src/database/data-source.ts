import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config({ path: '.env.local' });

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['apps/api-server/src/**/*.entity{.ts,.js}'],
  migrations: ['apps/api-server/src/database/migrations/*.ts'],
  migrationsTableName: 'migrations',
});
