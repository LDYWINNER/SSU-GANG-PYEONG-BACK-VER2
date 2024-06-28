import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PostCreatedEvent } from '../event/post-created.event';

@EventsHandler(PostCreatedEvent)
export class PostCreatedHandler implements IEventHandler<PostCreatedEvent> {
  handle(event: PostCreatedEvent) {
    //TODO: email to user 나중에 추가
    console.info(`Post created(id: ${event.id})`);
  }
}
