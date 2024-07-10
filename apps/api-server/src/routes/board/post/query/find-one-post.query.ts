import { IQuery } from '@nestjs/cqrs';

export class FindOnePostQuery implements IQuery {
  constructor(public readonly postId: string) {}
}
