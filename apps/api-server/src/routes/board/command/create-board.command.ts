import { ICommand } from '@nestjs/cqrs';

export class CreateBoardCommand implements ICommand {
  constructor(
    readonly userId: string,
    readonly contents: string,
  ) {}
}
