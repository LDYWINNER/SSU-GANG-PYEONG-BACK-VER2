import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  Delete,
  ValidationPipe,
  Query,
  UseGuards,
  InternalServerErrorException,
} from '@nestjs/common';
import { PostService } from './post.service';
import { ApiBearerAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { UpdatePostDto } from './dto/update-post.dto';
import {
  UserAfterAuth,
  UserInfo,
} from '../../../common/decorators/user-info.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { PageReqDto } from '../../../common/dto/page-request.dto';
import {
  ApiGetItemsResponse,
  ApiGetResponse,
} from '../../../common/decorators/swagger.decorator';
import { FindPostResDto } from './dto/res.dto';
import { PageResDto } from '../../../common/dto/page-response.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { ThrottlerBehindProxyGuard } from '../../../common/guard/throttler-behind-proxy.guard';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { CreatePostCommand } from './command/create-post.command';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FindPostsQuery } from './query/find-posts.query';
import { FindOnePostQuery } from './query/find-one-post.query';

@Controller('board/post')
@ApiTags('Board Post')
@ApiExtraModels(CreatePostDto, PageReqDto, PageResDto, FindPostResDto)
@UseGuards(ThrottlerBehindProxyGuard)
export class PostController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private readonly postService: PostService,
  ) {}

  @ApiGetItemsResponse(FindPostResDto)
  @Public()
  @SkipThrottle()
  @Get()
  async findAll(
    @Query() { page, size }: PageReqDto,
  ): Promise<FindPostResDto[]> {
    const findPostsQuery = new FindPostsQuery(page, size);
    const boards = await this.queryBus.execute(findPostsQuery);
    return boards.map(({ id, contents, user }) => {
      return {
        id,
        contents,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          boardCount: user.boardCount,
          createdAt: user.createdAt.toISOString(),
        },
      };
    });
  }

  @Public()
  @SkipThrottle()
  @ApiGetResponse(FindPostResDto)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<FindPostResDto> {
    const findOnePostQuery = new FindOnePostQuery(id);
    const { contents, user } = await this.queryBus.execute(findOnePostQuery);
    return {
      id,
      contents: contents,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        courseReviewCount: user.courseReviewCount,
        createdAt: user.createdAt.toISOString(),
      },
    };
  }

  @ApiBearerAuth('access-token')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post()
  async create(
    @UserInfo() userInfo: UserAfterAuth,
    @Body(new ValidationPipe()) data: CreatePostDto,
  ) {
    const { title, contents, boardId, anonymity } = data;
    const views = 0;
    const command = new CreatePostCommand(
      userInfo.id,
      title,
      contents,
      views,
      boardId,
      anonymity,
    );
    const result = await this.commandBus.execute(command);
    return result;
  }

  @ApiBearerAuth('access-token')
  @Put(':id')
  update(
    @UserInfo() userInfo: UserAfterAuth,
    @Param('id') id: string,
    @Body(new ValidationPipe()) data: UpdatePostDto,
  ) {
    return this.postService.update(userInfo.id, id, data);
  }

  @ApiBearerAuth('access-token')
  @Delete(':id')
  remove(@UserInfo() userInfo: UserAfterAuth, @Param('id') id: string) {
    return this.postService.delete(userInfo.id, id);
  }

  @Post('like/:id')
  @ApiBearerAuth('access-token')
  async createPostLike(
    @UserInfo() userInfo: UserAfterAuth,
    @Param('id') id: string,
  ) {
    try {
      const userId = userInfo.id;
      const result = await this.postService.likeBoardPost(userId, id);
      if (!result) {
        throw new InternalServerErrorException(
          `Failed to create post like for post id ${id}`,
        );
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get('like/:id')
  @ApiBearerAuth('access-token')
  async countPostLike(@Param('id') id: string) {
    try {
      const result = await this.postService.countLikes(id);
      if (!result) {
        throw new InternalServerErrorException(
          `Failed to count likes for post id ${id}`,
        );
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Delete('like/:id')
  @ApiBearerAuth('access-token')
  async deletePostLike(
    @UserInfo() userInfo: UserAfterAuth,
    @Param('id') id: string,
  ) {
    try {
      const userId = userInfo.id;
      const result = await this.postService.unlikeBoardPost(userId, id);
      if (!result) {
        throw new InternalServerErrorException(
          `Failed to delete like for post id ${id}`,
        );
      }
      return result;
    } catch (error) {
      throw error;
    }
  }
}
