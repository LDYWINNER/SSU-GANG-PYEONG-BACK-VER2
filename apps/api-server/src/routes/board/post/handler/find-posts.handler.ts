import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindPostsQuery } from '../query/find-posts.query';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardPost } from '../../../../entity/board-post.entity';
import { Repository, Like } from 'typeorm';
import { Board } from '../../../../entity/board.entity';

@QueryHandler(FindPostsQuery)
export class FindPostsQueryHandler implements IQueryHandler<FindPostsQuery> {
  constructor(
    @InjectRepository(BoardPost)
    private boardPostRepository: Repository<BoardPost>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  async execute(
    query: FindPostsQuery,
  ): Promise<{ posts: BoardPost[]; total: number }> {
    const { page, size, search, board } = query;

    const whereConditions: any = {};

    if (search) {
      whereConditions.title = Like(`%${search}%`);
      whereConditions.contents = Like(`%${search}%`);
    }

    if (board && board !== 'ALL') {
      const boardEntity = await this.boardRepository.findOne({
        where: { boardType: board },
      });

      if (boardEntity) {
        whereConditions.board = { id: boardEntity.id };
      }
    }

    const [posts, total] = await this.boardPostRepository.findAndCount({
      where: whereConditions,
      relations: ['user', 'board'],
      skip: (page - 1) * size,
      take: size,
      order: { createdAt: 'DESC' },
    });

    return { posts, total };
  }
}
