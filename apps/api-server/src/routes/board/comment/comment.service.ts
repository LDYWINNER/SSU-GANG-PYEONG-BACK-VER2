import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardComment, BoardPost, User } from '../../../entity';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(BoardComment)
    private boardCommentRepository: Repository<BoardComment>,
    @InjectRepository(BoardPost)
    private boardPostRepository: Repository<BoardPost>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  createComment = async (
    userId: string,
    createCommentDto: CreateCommentDto,
  ) => {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const boardPost = await this.boardPostRepository.findOne({
      where: { id: createCommentDto.boardPostId },
    });
    if (!boardPost) {
      throw new NotFoundException(
        `Board with id ${createCommentDto.boardPostId} not found`,
      );
    }

    const newComment = this.boardCommentRepository.create({
      content: createCommentDto.content,
      boardPost,
      user,
    });
    console.log('newComment', newComment);
    const savedComment = await this.boardCommentRepository.save(newComment);
    return { ...savedComment };
  };

  deleteComment = async (id: string) => {
    const comment = await this.boardCommentRepository.findOne({
      where: { id },
    });
    if (!comment) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }

    await this.boardCommentRepository.remove(comment);

    return comment;
  };
}
