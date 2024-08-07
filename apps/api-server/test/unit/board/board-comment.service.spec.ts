import { Test, TestingModule } from '@nestjs/testing';
import { StubCommentRepository } from './stub/comment-repository';
import { CommentService } from '../../../src/routes/board/comment/comment.service';
import {
  Board,
  BoardComment,
  BoardCommentLike,
  BoardPost,
  User,
} from '../../../src/entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { StubUserRepository } from '../user/stub-repository';
import { UserType } from '../../../src/common/enum/user.enum';
import { StubBoardPostRepository } from './stub/post-repository';
import { StubBoardCommentLikeRepository } from './stub/board-comment-like-repository';

describe('게시판 댓글 관련 서비스 테스트', () => {
  let boardCommentService: CommentService;
  let boardCommentRepository: StubCommentRepository;
  let boardPostRepository: StubBoardPostRepository;
  let boardCommentLikeRepository: StubBoardCommentLikeRepository;
  let userRepository: StubUserRepository;
  const boardCommentRepositoryToken = getRepositoryToken(BoardComment);
  const boardPostRepositoryToken = getRepositoryToken(BoardPost);
  const boardCommentLikeRepositoryToken = getRepositoryToken(BoardCommentLike);
  const userRepositoryToken = getRepositoryToken(User);

  beforeEach(async () => {
    boardCommentRepository = new StubCommentRepository();
    boardPostRepository = new StubBoardPostRepository();
    boardCommentLikeRepository = new StubBoardCommentLikeRepository();
    userRepository = new StubUserRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: boardCommentRepositoryToken,
          useValue: boardCommentRepository,
        },
        {
          provide: boardPostRepositoryToken,
          useValue: boardPostRepository,
        },
        {
          provide: boardCommentLikeRepositoryToken,
          useValue: boardCommentLikeRepository,
        },
        {
          provide: userRepositoryToken,
          useValue: userRepository,
        },
      ],
    }).compile();

    boardPostRepository.boardPosts.push({
      id: '1',
      title: 'Post 1',
      contents: 'Content 1',
      views: 10,
      user: {
        id: 'user-1',
        username: '',
        email: '',
        password: '',
        role: UserType.User.text,
        courseReviewCount: 0,
        createdAt: undefined,
        updateAt: undefined,
      },
      anonymity: false,
      createdAt: undefined,
      updateAt: undefined,
      board: new Board(),
      likes: 0,
    });

    boardCommentService = module.get<CommentService>(CommentService);
  });

  describe('createComment 함수 테스트', () => {
    it('createComment 함수 결과값 테스트', async () => {
      // given
      const userId = 'test_user_id';
      const boardCommentRowCount = boardCommentRepository.comments.length;

      // when
      const result = await boardCommentService.createComment(userId, {
        boardPostId: '1',
        content: 'comment_content',
      });

      // then
      expect(result).toEqual({
        id: 'comment-id',
        content: 'comment_content',
        boardPost: {
          id: '1',
          title: 'Post 1',
          contents: 'Content 1',
          views: 10,
          user: {
            id: 'user-1',
            username: '',
            email: '',
            password: '',
            role: UserType.User.text,
            courseReviewCount: 0,
            createdAt: undefined,
            updateAt: undefined,
          },
          anonymity: false,
          createdAt: undefined,
          updateAt: undefined,
          board: new Board(),
          likes: 0,
        },
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          courseReviewCount: 0,
          role: UserType.User.text,
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
        boardPost: {
          id: '1',
          title: 'Post 1',
          contents: 'Content 1',
          views: 10,
          user: {
            id: 'user-1',
            username: '',
            email: '',
            password: '',
            role: UserType.User.text,
            courseReviewCount: 0,
            createdAt: undefined,
            updateAt: undefined,
          },
          anonymity: false,
          createdAt: undefined,
          updateAt: undefined,
          board: new Board(),
          likes: 0,
        },
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          courseReviewCount: 0,
          role: UserType.User.text,
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
          boardPostId: '1',
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
          courseReviewCount: 0,
          role: UserType.User.text,
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
        boardPost: new BoardPost(),
        likes: 0,
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
          courseReviewCount: 0,
          role: UserType.User.text,
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
        boardPost: new BoardPost(),
        likes: 0,
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
          courseReviewCount: 0,
          role: UserType.User.text,
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
        boardPost: new BoardPost(),
        likes: 0,
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

  describe('likeBoardComment & unlikeBoardComment & countLikes 함수 테스트', () => {
    const userId = 'user-1';
    const commentId = 'comment_test_id';

    beforeEach(() => {
      boardCommentRepository.comments = [
        {
          id: 'comment_test_id',
          content: 'comment_content',
          createdAt: undefined,
          updatedAt: undefined,
          user: {
            createdAt: new Date('2024-06-28T18:19:29.764Z'),
            email: 'test_email',
            id: 'test_user_id',
            password: 'test_password',
            courseReviewCount: 0,
            role: UserType.User.text,
            updateAt: new Date('2024-06-28T18:19:29.764Z'),
            username: 'test_name',
          },
          boardPost: new BoardPost(),
          likes: 0,
        },
      ];
    });

    it('likeBoardComment 함수 테스트', async () => {
      // when
      const res = await boardCommentService.likeBoardComment(userId, commentId);

      // then
      expect(res).toEqual(
        expect.objectContaining({
          fk_user_id: 'user-1',
          fk_board_comment_id: 'comment_test_id',
        }),
      );
      expect(boardCommentLikeRepository.boardCommentLikes.length).toBe(1);
      expect(boardCommentRepository.comments[0].likes).toBe(1);
    });

    it('countLikes 함수 테스트', async () => {
      // given
      await boardCommentService.likeBoardComment(userId, commentId);

      // when
      const result = await boardCommentService.countLikes(commentId);

      // then
      expect(result).toEqual({
        count: 1,
        likers: ['user-1'],
      });
    });

    it('unlikeBoardComment 함수 테스트', async () => {
      // given
      await boardCommentService.likeBoardComment(userId, commentId);

      // when
      await boardCommentService.unlikeBoardComment(userId, commentId);

      // then
      expect(boardCommentRepository.comments[0].likes).toBe(0);
    });
  });
});
