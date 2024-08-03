import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ThrottlerBehindProxyGuard } from '../../common/guard/throttler-behind-proxy.guard';
import { BoardService } from './board.service';
import {
  UserAfterAuth,
  UserInfo,
} from '../../common/decorators/user-info.decorator';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Controller('board')
@ApiTags('Board')
@UseGuards(ThrottlerBehindProxyGuard)
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get()
  @ApiBearerAuth('access-token')
  async getAllBoards(@UserInfo() userInfo: UserAfterAuth) {
    try {
      const userId = userInfo.id;

      const boards = await this.boardService.getAllBoards(userId);
      if (!boards) {
        return [];
      }

      return boards;
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @ApiBearerAuth('access-token')
  async getBoardById(@Param('id') id: string) {
    try {
      const board = await this.boardService.getBoardById(id);
      if (!board) {
        throw new InternalServerErrorException(
          `Failed to get board by id: ${id}`,
        );
      }

      return board;
    } catch (error) {
      throw error;
    }
  }

  @Post()
  @ApiBearerAuth('access-token')
  async createBoard(
    @UserInfo() userInfo: UserAfterAuth,
    @Body() data: CreateBoardDto,
  ) {
    try {
      const userId = userInfo.id;
      const result = await this.boardService.createBoard(userId, data);
      if (!result) {
        throw new InternalServerErrorException('Failed to create board');
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  async deleteBoard(@Param('id') id: string) {
    try {
      const result = await this.boardService.deleteBoard(id);
      if (!result) {
        throw new InternalServerErrorException(
          `Failed to delete board by id: ${id}`,
        );
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  @ApiBearerAuth('access-token')
  async updateBoard(
    @Param('id') id: string,
    @Body(new ValidationPipe()) data: UpdateBoardDto,
  ) {
    try {
      const result = await this.boardService.updateBoard(id, data);
      if (!result) {
        throw new InternalServerErrorException('Failed to update board');
      }
      return result;
    } catch (error) {
      throw error;
    }
  }
}
