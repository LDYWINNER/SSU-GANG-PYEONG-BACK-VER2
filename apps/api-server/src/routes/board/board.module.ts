import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { CreatePostHandler } from './post/handler/create-post.handler';
import { PostCreatedHandler } from './post/handler/post-created.handler';
import { FindPostsQueryHandler } from './post/handler/find-posts.handler';
import { PostController } from './post/post.controller';
import { CommentController } from './comment/comment.controller';
import { PostService } from './post/post.service';
import {
  Board,
  BoardPost,
  User,
  BoardComment,
  BoardPostLike,
  BoardCommentLike,
} from '../../entity';
import { CommentService } from './comment/comment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Board,
      BoardPost,
      BoardComment,
      BoardPostLike,
      BoardCommentLike,
      User,
    ]),
    CqrsModule,
  ],
  controllers: [BoardController, PostController, CommentController],
  providers: [
    BoardService,
    CreatePostHandler,
    PostCreatedHandler,
    FindPostsQueryHandler,
    PostService,
    CommentService,
  ],
  exports: [BoardService, PostService, CommentService],
})
export class BoardModule {}
