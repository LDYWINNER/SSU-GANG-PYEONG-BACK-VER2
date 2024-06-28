import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../../entity/board.entity';
import { User } from '../../entity/user.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { CreatePostHandler } from './post/handler/create-post.handler';
import { PostCreatedHandler } from './post/handler/post-created.handler';
import { FindPostsQueryHandler } from './post/handler/find-posts.handler';
import { PostController } from './post/post.controller';
import { CommentController } from './comment/comment.controller';
import { PostService } from './post/post.service';
import { BoardPost } from '../../entity/board-post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Board, BoardPost, User]), CqrsModule],
  controllers: [BoardController, PostController, CommentController],
  providers: [
    BoardService,
    CreatePostHandler,
    PostCreatedHandler,
    FindPostsQueryHandler,
    PostService,
  ],
  exports: [BoardService, PostService],
})
export class BoardModule {}
