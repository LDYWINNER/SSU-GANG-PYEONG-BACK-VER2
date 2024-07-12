import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardComment, User } from '../../../entity';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(BoardComment)
    private boardCommentRepository: Repository<BoardComment>,
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

    const newComment = this.boardCommentRepository.create({
      ...createCommentDto,
      user,
    });
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
