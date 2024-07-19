import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import {
  Initialize1720855793915,
  CourseAvgGrade1720937829565,
  LikeFeature1721126104287,
  CourseLocation1721130117933,
  LikeEntityDeleteCascade1721280155092,
  FollowEntity1721317720001,
  FollowEntity1721322858204,
  Enum1721366470719,
  UserPostCount1721376941980,
  UserPostCount1721385720583,
} from './migrations';

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT || '5434'),
  database: process.env.POSTGRES_DB || 'postgres',
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  entities: ['apps/api-server/src/entity/*.entity{.ts,.js}'],
  migrations: [
    Initialize1720855793915,
    CourseAvgGrade1720937829565,
    LikeFeature1721126104287,
    CourseLocation1721130117933,
    LikeEntityDeleteCascade1721280155092,
    FollowEntity1721317720001,
    FollowEntity1721322858204,
    Enum1721366470719,
    UserPostCount1721376941980,
    UserPostCount1721385720583,
  ],
  migrationsTableName: 'migrations',
};

export const dataSource = new DataSource(options);
