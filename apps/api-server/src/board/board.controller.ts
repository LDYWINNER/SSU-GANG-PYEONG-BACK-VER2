import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { BoardService } from './board.service';

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get()
  findAll() {
    return this.boardService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return `This action returns a #${id} board`;
  }

  @Post()
  create(@Body() data) {
    return data;
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() data) {
    return data;
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return `This action removes a #${id} board`;
  }
}
