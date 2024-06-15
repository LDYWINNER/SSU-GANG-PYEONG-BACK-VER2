import { NestFactory } from '@nestjs/core';
import { ApiServerModule } from './api-server.module';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerCustomOptions,
} from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptor/transform.interceptor';

async function bootstrap() {
  const port = 3000;
  const app = await NestFactory.create(ApiServerModule);

  const config = new DocumentBuilder()
    .setTitle('SSU-GANG-PYEONG-BACKEND-VER.2.0')
    .setDescription('API description for SSU-GANG-PYEONG-BACKEND-VER.2.0')
    .setVersion('1.0')
    .addTag('Board')
    .addTag('User')
    .addBearerAuth()
    .build();
  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
    },
  };
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, customOptions);

  // ValidationPipe를 전역으로 설정
  app.useGlobalPipes(
    new ValidationPipe({
      // class-transformer 적용
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor());

  await app.listen(3000);
  console.info(`listening on port ${port}`);
  console.info(`NODE_ENV: ${process.env.NODE_ENV}`);
}
bootstrap();
