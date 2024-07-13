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
    const boardPost = await this.getBoardPostById(id);

    if (!boardPost) throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);

    if (userId !== boardPost.user.id) {
      throw new UnauthorizedException();
    }

    await this.boardPostRepository.update(id, {
      ...data,
    });

    return this.boardPostRepository.findOne({
      where: { id },
      relations: ['user', 'board'],
    });
  }

  async delete(userId: string, id: string) {
    const boardPost = await this.getBoardPostById(id);

    if (!boardPost) throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);

    if (userId !== boardPost.user.id) {
      throw new UnauthorizedException();
    }

    await this.boardPostRepository.remove(boardPost);

    return boardPost;
  }

  async getBoardPostById(id: string) {
    const result = await this.boardPostRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    return result;
  }
}
