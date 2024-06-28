import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from '../../../../entity/user.entity';
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
    const { userId, title, contents, views, board, anonymity } = command;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    let error;
    try {
      const user = await queryRunner.manager.findOneBy(User, { id: userId });
      const post = await queryRunner.manager.save(
        queryRunner.manager.create(BoardPost, {
          title,
          contents,
          views,
          board: { id: board },
          anonymity,
          user,
        }),
      );

      await queryRunner.manager.save(post);
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
