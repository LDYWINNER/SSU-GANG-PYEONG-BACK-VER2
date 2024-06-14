import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ApiServerController } from './api-server.controller';
import { ApiServerService } from './api-server.service';
import { BoardModule } from './routes/board/board.module';
import { LoggingMiddleware } from './middleware/logging.middleware';
import ConfigModule from './config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './routes/user/user.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule(),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: process.env.JWT_LIFETIME,
      },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      logging: true,
      autoLoadEntities: true,
    }),
    BoardModule,
    UserModule,
    AuthModule,
  ],
  controllers: [ApiServerController],
  providers: [ApiServerService],
})
export class ApiServerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
