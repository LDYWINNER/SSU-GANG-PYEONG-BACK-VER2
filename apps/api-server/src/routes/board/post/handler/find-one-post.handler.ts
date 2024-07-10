import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardPost } from '../../../../entity/board-post.entity';
import { Repository } from 'typeorm';
import { FindOnePostQuery } from '../query/find-one-post.query';

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
    return await this.boardPostRepository.findOne({
      where: { id: postId },
      relations: ['user', 'comments'],
    });
  }
}
