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
import redisConfig from './config/redis.config';
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
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [postgresConfig, jwtConfig, sentryConfig, emailConfig, redisConfig],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('redis.host'),
        port: configService.get('redis.port'),
      }),
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: configService.get('email.user'),
            pass: configService.get('email.pass'),
          },
        },
        defaults: {
          from: `"SSUGANGPYEONG" <${configService.get('email.user')}>`,
        },
        template: {
          dir: process.cwd() + '/template/',
          adapter: new EjsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
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
  providers: [ApiServerService],
})
export class ApiServerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
