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
} from '@nestjs/common';
import { BoardService } from './board.service';
import { ApiBearerAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { UpdateBoardDto } from './dto/update-board.dto';
import {
  UserAfterAuth,
  UserInfo,
} from '../../common/decorators/user-info.decorator';
import { CreateBoardDto } from './dto/create-board.dto';
import { PageReqDto } from '../../common/dto/page-request.dto';
import {
  ApiGetItemsResponse,
  ApiGetResponse,
} from '../../common/decorators/swagger.decorator';
import { FindBoardResDto } from './dto/res.dto';
import { PageResDto } from '../../common/dto/page-response.dto';
import { Public } from '../../common/decorators/public.decorator';
import { ThrottlerBehindProxyGuard } from '../../common/guard/throttler-behind-proxy.guard';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { CreateBoardCommand } from './command/create-board.command';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FindBoardsQuery } from './query/find-boards.query';

@Controller('board')
@ApiTags('Board')
@ApiExtraModels(CreateBoardDto, PageReqDto, PageResDto, FindBoardResDto)
@UseGuards(ThrottlerBehindProxyGuard)
export class BoardController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private readonly boardService: BoardService,
  ) {}

  @ApiGetItemsResponse(FindBoardResDto)
  @Public()
  @SkipThrottle()
  @Get()
  async findAll(
    @Query() { page, size }: PageReqDto,
  ): Promise<FindBoardResDto[]> {
    const findBoardsQuery = new FindBoardsQuery(page, size);
    const boards = await this.queryBus.execute(findBoardsQuery);
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
  @ApiGetResponse(FindBoardResDto)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<FindBoardResDto> {
    const { contents, user } = await this.boardService.findOne(id);
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
  }

  @ApiBearerAuth()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post()
  async create(
    @UserInfo() userInfo: UserAfterAuth,
    @Body('contents') contents: string,
  ) {
    const command = new CreateBoardCommand(userInfo.id, contents);
    const { id } = await this.commandBus.execute(command);
    return { id, contents };
  }

  @ApiBearerAuth()
  @Put(':id')
  update(
    @UserInfo() userInfo: UserAfterAuth,
    @Param('id') id: string,
    @Body(new ValidationPipe()) data: UpdateBoardDto,
  ) {
    return this.boardService.update(userInfo.id, id, data);
  }

  @ApiBearerAuth()
  @Delete(':id')
  remove(@UserInfo() userInfo: UserAfterAuth, @Param('id') id: string) {
    return this.boardService.delete(userInfo.id, id);
  }
}
