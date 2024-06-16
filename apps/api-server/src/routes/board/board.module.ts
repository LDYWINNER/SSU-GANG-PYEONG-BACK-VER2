import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../../entity/board.entity';
import { User } from '../../entity/user.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateBoardHandler } from './handler/create-board.handler';
import { BoardCreatedHandler } from './handler/board-created.handler';
import { FindBoardsQueryHandler } from './handler/find-boards.handler';

@Module({
  imports: [TypeOrmModule.forFeature([Board, User]), CqrsModule],
  controllers: [BoardController],
  providers: [
    BoardService,
    CreateBoardHandler,
    BoardCreatedHandler,
    FindBoardsQueryHandler,
  ],
})
export class BoardModule {}
