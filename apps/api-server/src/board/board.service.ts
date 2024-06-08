import { Injectable } from '@nestjs/common';

@Injectable()
export class BoardService {
  findAll() {
    return 'This action returns all board';
  }

  findOne(id: number) {
    return `This action returns a #${id} board`;
  }

  create(data) {
    return data;
  }

  update(id: number, data) {
    return data;
  }

  remove(id: number) {
    return `This action removes a #${id} board`;
  }
}
