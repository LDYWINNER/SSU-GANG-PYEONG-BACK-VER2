import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User, Board } from '../../../../entity';
import { BoardPost } from '../../../../entity/board-post.entity';
import { CreatePostCommand } from '../command/create-post.command';
import { PostCreatedEvent } from '../event/post-created.event';

@Injectable()
@CommandHandler(CreatePostCommand)
export class CreatePostHandler implements ICommandHandler<CreatePostCommand> {
  constructor(
    private dataSource: DataSource,
    private eventBus: EventBus,
  ) {}

  async execute(command: CreatePostCommand): Promise<BoardPost> {
    const { userId, title, contents, views, boardId, anonymity } = command;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    let error;
    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException(`User with id ${userId} not found`);
      }

      const board = await queryRunner.manager.findOne(Board, {
        where: { id: boardId },
      });
      if (!board) {
        throw new NotFoundException(`Board with id ${boardId} not found`);
      }

      const post = await queryRunner.manager.save(
        queryRunner.manager.create(BoardPost, {
          title,
          contents,
          views,
          board,
          anonymity,
          user,
        }),
      );

      await queryRunner.commitTransaction();
      this.eventBus.publish(new PostCreatedEvent(post.id));
      return post;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      error = e;
    } finally {
      await queryRunner.release();
      if (error) throw error;
    }
  }
}
