import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardPost, BoardPostLike } from '../../../entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(BoardPost)
    private boardPostRepository: Repository<BoardPost>,
    @InjectRepository(BoardPostLike)
    private boardPostLikeRepository: Repository<BoardPostLike>,
  ) {}

  findTop5Download = async () => {
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
  };

  update = async (userId: string, id: string, data: UpdatePostDto) => {
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
  };

  delete = async (userId: string, id: string) => {
    const boardPost = await this.getBoardPostById(id);

    if (!boardPost) throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);

    if (userId !== boardPost.user.id) {
      throw new UnauthorizedException();
    }

    await this.boardPostRepository.remove(boardPost);

    return boardPost;
  };

  getBoardPostById = async (id: string) => {
    const result = await this.boardPostRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    return result;
  };

  likeBoardPost = async (userId: string, boardPostId: string) => {
    await this.boardPostRepository.update(boardPostId, {
      likes: () => 'likes + 1',
    });

    const boardPostLike = this.boardPostLikeRepository.create({
      fk_user_id: userId,
      fk_board_post_id: boardPostId,
    });
    return await this.boardPostLikeRepository.save(boardPostLike);
  };

  unlikeBoardPost = async (userId: string, boardPostId: string) => {
    await this.boardPostRepository.update(boardPostId, {
      likes: () => 'likes - 1',
    });

    const boardPostLike = await this.boardPostLikeRepository.findOne({
      where: { fk_user_id: userId, fk_board_post_id: boardPostId },
    });
    if (!boardPostLike) {
      throw new NotFoundException(
        `Board post like with id ${boardPostId} not found`,
      );
    }

    await this.boardPostLikeRepository.remove(boardPostLike);

    return boardPostLike;
  };

  countLikes = async (boardPostId: string) => {
    const likes = await this.boardPostLikeRepository.find({
      where: { fk_board_post_id: boardPostId },
    });

    return {
      count: likes.length,
      likers: [...likes.map((like) => like.fk_user_id)],
    };
  };
}
