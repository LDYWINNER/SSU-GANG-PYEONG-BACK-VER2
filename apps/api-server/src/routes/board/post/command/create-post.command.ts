import { ICommand } from '@nestjs/cqrs';

export class CreatePostCommand implements ICommand {
  constructor(
    readonly userId: string,
    readonly title: string,
    readonly contents: string,
    readonly views: number,
    readonly board: string,
    readonly anonymity: boolean,
  ) {}
}
