import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardPost } from '../../../../entity/board-post.entity';
import { Repository } from 'typeorm';
import { FindOnePostQuery } from '../query/find-one-post.query';
import { HttpException, HttpStatus } from '@nestjs/common';

@QueryHandler(FindOnePostQuery)
export class FindOnePostQueryHandler
  implements IQueryHandler<FindOnePostQuery>
{
  constructor(
    @InjectRepository(BoardPost)
    private boardPostRepository: Repository<BoardPost>,
  ) {}

  async execute(query: FindOnePostQuery): Promise<BoardPost> {
    const { postId } = query;

    // Find the board post
    const board = await this.boardPostRepository.findOne({
      where: { id: postId },
      relations: ['user', 'comments'],
    });

    if (!board) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    // Update views count
    await this.boardPostRepository.update(postId, { views: board.views + 1 });

    return board;
  }
}
