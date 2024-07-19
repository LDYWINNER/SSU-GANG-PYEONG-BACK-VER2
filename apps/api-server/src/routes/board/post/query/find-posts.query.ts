import { IQuery } from '@nestjs/cqrs';

export class FindPostsQuery implements IQuery {
  constructor(
    readonly page: number,
    readonly size: number,
    public readonly search?: string,
    public readonly board?: string,
  ) {}
}
