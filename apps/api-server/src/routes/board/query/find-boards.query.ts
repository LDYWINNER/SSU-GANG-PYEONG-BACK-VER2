import { IQuery } from '@nestjs/cqrs';

export class FindBoardsQuery implements IQuery {
  constructor(
    readonly page: number,
    readonly size: number,
  ) {}
}
