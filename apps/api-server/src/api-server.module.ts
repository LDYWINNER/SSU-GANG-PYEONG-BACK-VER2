import { Module } from '@nestjs/common';
import { ApiServerController } from './api-server.controller';
import { ApiServerService } from './api-server.service';
import { BoardModule } from './board/board.module';

@Module({
  imports: [BoardModule],
  controllers: [ApiServerController],
  providers: [ApiServerService],
})
export class ApiServerModule {}
