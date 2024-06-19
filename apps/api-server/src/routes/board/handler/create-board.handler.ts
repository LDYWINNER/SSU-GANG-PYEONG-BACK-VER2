import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from '../../../entity/user.entity';
import { Board } from '../../../entity/board.entity';
import { CreateBoardCommand } from '../command/create-board.command';
import { BoardCreatedEvent } from '../event/board-created.event';

@Injectable()
@CommandHandler(CreateBoardCommand)
export class CreateBoardHandler implements ICommandHandler<CreateBoardCommand> {
  constructor(
    private dataSource: DataSource,
    private eventBus: EventBus,
  ) {}

  async execute(command: CreateBoardCommand): Promise<Board> {
    const { userId, title, contents, views, category, anonymity } = command;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    let error;
    try {
      const user = await queryRunner.manager.findOneBy(User, { id: userId });
      const board = await queryRunner.manager.save(
        queryRunner.manager.create(Board, {
          title,
          contents,
          views,
          category,
          anonymity,
          user,
        }),
      );

      await queryRunner.manager.save(board);
      await queryRunner.commitTransaction();
      this.eventBus.publish(new BoardCreatedEvent(board.id));
      return board;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      error = e;
    } finally {
      await queryRunner.release();
      if (error) throw error;
    }
  }
}