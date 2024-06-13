import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  Delete,
  UnauthorizedException,
  ValidationPipe,
  Query,
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
import { ApiGetItemsResponse } from '../../common/decorators/swagger.decorator';
import { FindBoardResDto } from './dto/res.dto';
import { PageResDto } from '../../common/dto/page-response.dto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('board')
@ApiTags('Board')
@ApiExtraModels(CreateBoardDto, PageReqDto, PageResDto)
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @ApiGetItemsResponse(FindBoardResDto)
  @Public()
  @Get()
  findAll(@Query() { page, size }: PageReqDto) {
    return this.boardService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.boardService.findOne(id);
  }

  @ApiBearerAuth()
  @Post()
  create(
    @UserInfo() userInfo: UserAfterAuth,
    @Body('contents') contents: string,
  ) {
    if (!userInfo) throw new UnauthorizedException();

    return this.boardService.create({
      userId: userInfo.id,
      contents,
    });
  }

  @ApiBearerAuth()
  @Put(':id')
  update(
    @UserInfo() userInfo,
    @Param('id') id: string,
    @Body(new ValidationPipe()) data: UpdateBoardDto,
  ) {
    return this.boardService.update(userInfo.id, id, data);
  }

  @ApiBearerAuth()
  @Delete(':id')
  remove(@UserInfo() userInfo, @Param('id') id: string) {
    return this.boardService.delete(userInfo.id, id);
  }
}
