import { ICommand } from '@nestjs/cqrs';

export class CreateBoardCommand implements ICommand {
  constructor(
    readonly userId: string,
    readonly title: string,
    readonly contents: string,
    readonly views: number,
    readonly category: string,
    readonly anonymity: boolean,
  ) {}
}
