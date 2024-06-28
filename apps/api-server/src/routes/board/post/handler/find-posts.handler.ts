import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindPostsQuery } from '../query/find-posts.query';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardPost } from '../../../../entity/board-post.entity';
import { Repository } from 'typeorm';

@QueryHandler(FindPostsQuery)
export class FindPostsQueryHandler implements IQueryHandler<FindPostsQuery> {
  constructor(
    @InjectRepository(BoardPost)
    private boardPostRepository: Repository<BoardPost>,
  ) {}

  async execute({ page, size }: FindPostsQuery): Promise<BoardPost[]> {
    const boards = await this.boardPostRepository.find({
      relations: ['user'],
      skip: (page - 1) * size,
      take: size,
    });
    return boards;
  }
}
