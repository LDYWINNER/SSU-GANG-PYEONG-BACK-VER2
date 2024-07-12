import { Test, TestingModule } from '@nestjs/testing';
import { StubCommentRepository } from './stub/comment-repository';
import { CommentService } from '../../../src/routes/board/comment/comment.service';
import { BoardComment, BoardPost, User } from '../../../src/entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { StubUserRepository } from '../user/stub-repository';
import { Role } from '../../../src/common/enum/user.enum';

describe('유저 게시판 댓글 관련 서비스 테스트', () => {
  let boardCommentService: CommentService;
  let boardCommentRepository: StubCommentRepository;
  let userRepository: StubUserRepository;
  const boardCommentRepositoryToken = getRepositoryToken(BoardComment);
  const userRepositoryToken = getRepositoryToken(User);

  beforeEach(async () => {
    boardCommentRepository = new StubCommentRepository();
    userRepository = new StubUserRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: boardCommentRepositoryToken,
          useValue: boardCommentRepository,
        },
        {
          provide: userRepositoryToken,
          useValue: userRepository,
        },
      ],
    }).compile();

    boardCommentService = module.get<CommentService>(CommentService);
  });

  describe('createComment 함수 테스트', () => {
    it('createComment 함수 결과값 테스트', async () => {
      // given
      const userId = 'test_user_id';
      const boardCommentRowCount = boardCommentRepository.comments.length;

      // when
      const result = await boardCommentService.createComment(userId, {
        content: 'comment_content',
      });

      // then
      expect(result).toEqual({
        id: 'comment-id',
        content: 'comment_content',
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          postCount: 0,
          role: 'USER',
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
      expect(boardCommentRepository.comments.length).toBe(
        boardCommentRowCount + 1,
      );
      expect(boardCommentRepository.comments).toContainEqual({
        id: 'comment-id',
        content: 'comment_content',
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          postCount: 0,
          role: 'USER',
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
    });

    it('userId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const userId = 'invalid-user-id';

      // then
      expect(
        boardCommentService.createComment(userId, {
          content: 'comment_content',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteComment 함수 테스트', () => {
    it('deleteComment 함수 결과값 테스트', async () => {
      // given
      const commentId = 'comment_test_id';
      boardCommentRepository.comments.push({
        id: 'comment_test_id',
        content: 'comment_content',
        createdAt: undefined,
        updatedAt: undefined,
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          postCount: 0,
          role: Role.User,
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
        boardPost: new BoardPost(),
      });
      const boardCommentRowCount = boardCommentRepository.comments.length;

      // when
      const result = await boardCommentService.deleteComment(commentId);

      // then
      expect(result).toEqual({
        id: 'comment_test_id',
        content: 'comment_content',
        createdAt: undefined,
        updatedAt: undefined,
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          postCount: 0,
          role: Role.User,
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
        boardPost: new BoardPost(),
      });
      expect(boardCommentRepository.comments.length).toBe(
        boardCommentRowCount - 1,
      );
      expect(boardCommentRepository.comments).not.toContainEqual({
        id: 'comment_test_id',
        content: 'comment_content',
        createdAt: undefined,
        updatedAt: undefined,
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          postCount: 0,
          role: Role.User,
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
        boardPost: new BoardPost(),
      });
    });

    it('commentId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const commentId = 'invalid-comment-id';

      // then
      expect(boardCommentService.deleteComment(commentId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
