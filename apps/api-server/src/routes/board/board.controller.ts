import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  Delete,
  UseGuards,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { BoardService } from './board.service';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { UpdateBoardDto } from './dto/update-board.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UserInfo } from '../../decorators/user-info.decorator';
import { CreateBoardDto } from './dto/create-board.dto';

@Controller('board')
@ApiTags('Board')
@ApiExtraModels(CreateBoardDto)
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get()
  findAll() {
    return this.boardService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.boardService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@UserInfo() userInfo, @Body('contents') contents: string) {
    if (!userInfo) throw new UnauthorizedException();

    return this.boardService.create({
      userId: userInfo.id,
      contents,
    });
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @UserInfo() userInfo,
    @Param('id') id: string,
    @Body(new ValidationPipe()) data: UpdateBoardDto,
  ) {
    return this.boardService.update(userInfo.id, id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@UserInfo() userInfo, @Param('id') id: string) {
    return this.boardService.delete(userInfo.id, id);
  }
}
