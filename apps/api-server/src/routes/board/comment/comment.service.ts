import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BoardComment,
  BoardCommentLike,
  BoardPost,
  User,
} from '../../../entity';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(BoardComment)
    private readonly boardCommentRepository: Repository<BoardComment>,
    @InjectRepository(BoardPost)
    private readonly boardPostRepository: Repository<BoardPost>,
    @InjectRepository(BoardCommentLike)
    private readonly boardCommentLikeRepository: Repository<BoardCommentLike>,
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

  likeBoardComment = async (userId: string, boardCommentId: string) => {
    await this.boardCommentRepository.update(boardCommentId, {
      likes: () => 'likes + 1',
    });

    const boardCommentLike = this.boardCommentLikeRepository.create({
      fk_user_id: userId,
      fk_board_comment_id: boardCommentId,
    });
    return await this.boardCommentLikeRepository.save(boardCommentLike);
  };

  unlikeBoardComment = async (userId: string, boardCommentId: string) => {
    await this.boardCommentRepository.update(boardCommentId, {
      likes: () => 'likes - 1',
    });

    return await this.boardCommentLikeRepository.delete({
      fk_user_id: userId,
      fk_board_comment_id: boardCommentId,
    });
  };

  countLikes = async (boardCommentId: string) => {
    return await this.boardCommentLikeRepository.count({
      where: { fk_board_comment_id: boardCommentId },
    });
  };
}
