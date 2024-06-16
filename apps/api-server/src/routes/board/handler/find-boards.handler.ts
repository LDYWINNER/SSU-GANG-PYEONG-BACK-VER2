import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindBoardsQuery } from '../query/find-boards.query';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from '../../../entity/board.entity';
import { Repository } from 'typeorm';

@QueryHandler(FindBoardsQuery)
export class FindBoardsQueryHandler implements IQueryHandler<FindBoardsQuery> {
  constructor(
    @InjectRepository(Board) private boardRepository: Repository<Board>,
  ) {}

  async execute({ page, size }: FindBoardsQuery): Promise<Board[]> {
    const boards = await this.boardRepository.find({
      relations: ['user'],
      skip: (page - 1) * size,
      take: size,
    });
    return boards;
  }
}
