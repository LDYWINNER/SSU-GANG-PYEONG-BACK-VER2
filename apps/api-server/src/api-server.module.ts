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
import { TodoModule } from './todo/todo.module';
import postgresConfig from './config/postgres.config';
import jwtConfig from './config/jwt.config';
import sentryConfig from './config/sentry.config';
import emailConfig from './config/email.config';

@Module({
  imports: [
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
          synchronize: false,
        };
        // local 환경에서만 개발 편의성을 위해 활용
        if (configService.get('STAGE') === 'local') {
          obj = Object.assign(obj, {
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
  ],
  controllers: [ApiServerController],
  providers: [ApiServerService],
})
export class ApiServerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
