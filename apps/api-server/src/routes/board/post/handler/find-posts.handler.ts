import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindPostsQuery } from '../query/find-posts.query';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardPost } from '../../../../entity/board-post.entity';
import { Repository, Like } from 'typeorm';
import { Board } from '../../../../entity/board.entity';
import { BoardType } from '../../../../common/enum/board.enum';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';

@QueryHandler(FindPostsQuery)
export class FindPostsQueryHandler implements IQueryHandler<FindPostsQuery> {
  constructor(
    @InjectRepository(BoardPost)
    private boardPostRepository: Repository<BoardPost>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async execute(
    query: FindPostsQuery,
  ): Promise<{ posts: BoardPost[]; total: number }> {
    const { page, size, search, board } = query;

    const cacheKey = `posts_${page}_${size}_${search || 'nosearch'}_${board || 'all'}`;

    const cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) {
      return cachedResult as { posts: BoardPost[]; total: number };
    }

    const whereConditions: any = {};

    if (search) {
      whereConditions.title = Like(`%${search}%`);
      whereConditions.contents = Like(`%${search}%`);
    }

    if (board && board !== BoardType.All.text) {
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

    await this.cacheManager.set(cacheKey, { posts, total }, 60 * 60 * 5);

    return { posts, total };
  }
}
