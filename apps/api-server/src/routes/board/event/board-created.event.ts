import { IEvent } from '@nestjs/cqrs';

export class BoardCreatedEvent implements IEvent {
  constructor(readonly id: string) {}
}
