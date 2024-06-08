import { Injectable } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardService {
  findAll() {
    return 'This action returns all board';
  }

  findOne(id: number) {
    return `This action returns a #${id} board`;
  }

  create(data: CreateBoardDto) {
    return data;
  }

  update(id: number, data: UpdateBoardDto) {
    return data;
  }

  remove(id: number) {
    return `This action removes a #${id} board`;
  }
}
