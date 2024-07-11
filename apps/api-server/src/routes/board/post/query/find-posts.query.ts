import { IQuery } from '@nestjs/cqrs';
import { BoardType } from '../../../../common/enum/board.enum';

export class FindPostsQuery implements IQuery {
  constructor(
    readonly page: number,
    readonly size: number,
    public readonly search?: string,
    public readonly board?: BoardType,
  ) {}
}
