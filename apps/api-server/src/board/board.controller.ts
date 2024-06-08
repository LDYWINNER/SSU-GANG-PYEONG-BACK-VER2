import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  Delete,
} from '@nestjs/common';

@Controller('board')
export class BoardController {
  @Get()
  findAll() {
    return 'This action returns all boards';
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
