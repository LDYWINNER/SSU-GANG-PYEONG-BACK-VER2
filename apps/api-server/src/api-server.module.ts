import { Module } from '@nestjs/common';
import { ApiServerController } from './api-server.controller';
import { ApiServerService } from './api-server.service';
import { BoardController } from './board/board.controller';

@Module({
  imports: [],
  controllers: [ApiServerController, BoardController],
  providers: [ApiServerService],
})
export class ApiServerModule {}
