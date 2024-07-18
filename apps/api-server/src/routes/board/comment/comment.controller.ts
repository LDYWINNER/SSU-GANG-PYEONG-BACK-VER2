import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ThrottlerBehindProxyGuard } from '../../../common/guard/throttler-behind-proxy.guard';
import { CommentService } from './comment.service';
import {
  UserAfterAuth,
  UserInfo,
} from '../../../common/decorators/user-info.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('board/comment')
@ApiTags('Comment')
@UseGuards(ThrottlerBehindProxyGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  async createComment(
    @UserInfo() userInfo: UserAfterAuth,
    @Body() data: CreateCommentDto,
  ) {
    try {
      const userId = userInfo.id;
      const result = await this.commentService.createComment(userId, data);
      if (!result) {
        throw new InternalServerErrorException('Failed to create comment');
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  async deleteComment(@Param('id') id: string) {
    try {
      const result = await this.commentService.deleteComment(id);
      if (!result) {
        throw new InternalServerErrorException('Failed to delete comment');
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Post('like/:id')
  async createCommentLike(
    @UserInfo() userInfo: UserAfterAuth,
    @Param('id') id: string,
  ) {
    try {
      const userId = userInfo.id;
      const result = await this.commentService.likeBoardComment(userId, id);
      if (!result) {
        throw new InternalServerErrorException(
          `Failed to create comment like for comment id ${id}`,
        );
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get('like/:id')
  async countCommentLike(@Param('id') id: string) {
    try {
      const result = await this.commentService.countLikes(id);
      if (!result) {
        throw new InternalServerErrorException(
          `Failed to count likes for comment id ${id}`,
        );
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Delete('like/:id')
  async deleteCommentLike(
    @UserInfo() userInfo: UserAfterAuth,
    @Param('id') id: string,
  ) {
    try {
      const userId = userInfo.id;
      const result = await this.commentService.unlikeBoardComment(userId, id);
      if (!result) {
        throw new InternalServerErrorException(
          `Failed to delete like for comment id ${id}`,
        );
      }
      return result;
    } catch (error) {
      throw error;
    }
  }
}
