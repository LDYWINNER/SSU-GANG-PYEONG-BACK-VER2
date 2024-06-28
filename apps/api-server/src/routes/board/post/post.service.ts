import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardPost } from '../../../entity/board-post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(BoardPost)
    private boardPostRepository: Repository<BoardPost>,
  ) {}

  async findOne(id: string) {
    const board = await this.boardPostRepository.findOne({
      where: {
        id,
      },
      relations: {
        user: true,
      },
    });

    if (!board) throw new HttpException('NotFound', HttpStatus.NOT_FOUND);

    await this.boardPostRepository.update({ id }, { views: () => 'views + 1' });

    return board;
  }

  async findTop5Download() {
    const boards = await this.boardPostRepository.find({
      relations: {
        user: true,
      },
      order: {
        views: 'DESC',
      },
      take: 5,
    });

    return boards;
  }

  async update(userId: string, id: string, data: UpdatePostDto) {
    const board = await this.getBoardById(id);

    if (!board) throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);

    if (userId !== board.user.id) {
      throw new UnauthorizedException();
    }

    return this.boardPostRepository.update(id, {
      ...data,
    });
  }

  async delete(userId: string, id: string) {
    const board = await this.getBoardById(id);

    if (!board) throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);

    if (userId !== board.user.id) {
      throw new UnauthorizedException();
    }

    return this.boardPostRepository.remove(board);
  }

  async getBoardById(id: string) {
    return this.boardPostRepository.findOneBy({
      id,
    });
  }
}
