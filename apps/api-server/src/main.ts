import { NestFactory } from '@nestjs/core';
import { ApiServerModule } from './api-server.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(ApiServerModule);

  const config = new DocumentBuilder()
    .setTitle('SSU-GANG-PYEONG-BACKEND-VER.2.0')
    .setDescription('API description for SSU-GANG-PYEONG-BACKEND-VER.2.0')
    .setVersion('1.0')
    .addTag('Board')
    .addTag('User')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
