import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ApiServerController } from './api-server.controller';
import { ApiServerService } from './api-server.service';
import { BoardModule } from './routes/board/board.module';
import { LoggingMiddleware } from './middleware/logging.middleware';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserModule } from './routes/user/user.module';
import { AuthModule } from './auth/auth.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { HealthModule } from './routes/health/health.module';
import { AnalyticsModule } from './routes/analytics/analytics.module';
import { EmailModule } from './routes/email/email.module';
import { CourseModule } from './routes/course/course.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TodoModule } from './routes/todo/todo.module';
import { TableModule } from './routes/table/table.module';
import postgresConfig from './config/postgres.config';
import jwtConfig from './config/jwt.config';
import sentryConfig from './config/sentry.config';
import emailConfig from './config/email.config';
import {
  User,
  Table,
  SchoolSchedule,
  PersonalSchedule,
  RefreshToken,
  Board,
  BoardPost,
  BoardComment,
  ToDoCategory,
  ToDoTask,
  Course,
  CourseReview,
} from '../src/entity';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { RedisClientOptions } from 'redis';
import { CacheKeyService } from './routes/cache-key/cache-key.service';

@Module({
  imports: [
    CacheModule.register<RedisClientOptions>({
      store: redisStore,
      socket: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379'),
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [postgresConfig, jwtConfig, sentryConfig, emailConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        let obj: TypeOrmModuleOptions = {
          type: 'postgres',
          host: configService.get('postgres.host'),
          port: configService.get('postgres.port'),
          database: configService.get('postgres.database'),
          username: configService.get('postgres.username'),
          password: configService.get('postgres.password'),
          autoLoadEntities: true,
          entities: [
            User,
            Table,
            SchoolSchedule,
            PersonalSchedule,
            RefreshToken,
            Board,
            BoardPost,
            BoardComment,
            ToDoCategory,
            ToDoTask,
            Course,
            CourseReview,
          ],
          synchronize: false,
        };
        // local 환경에서만 개발 편의성을 위해 활용
        if (configService.get('STAGE') === 'local') {
          obj = Object.assign(obj, {
            synchronize: false,
            logging: true,
          });
        }
        return obj;
      },
    }),
    BoardModule,
    UserModule,
    AuthModule,
    HealthModule,
    AnalyticsModule,
    EmailModule,
    CourseModule,
    TodoModule,
    TableModule,
  ],
  controllers: [ApiServerController],
  providers: [ApiServerService, CacheKeyService],
})
export class ApiServerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
