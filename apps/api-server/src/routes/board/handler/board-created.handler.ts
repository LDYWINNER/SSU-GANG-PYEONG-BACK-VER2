import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { BoardCreatedEvent } from '../event/board-created.event';

@EventsHandler(BoardCreatedEvent)
export class BoardCreatedHandler implements IEventHandler<BoardCreatedEvent> {
  handle(event: BoardCreatedEvent) {
    //TODO: email to user 나중에 추가
    console.info(`Board created(id: ${event.id})`);
  }
}
