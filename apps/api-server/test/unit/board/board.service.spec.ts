import { Test, TestingModule } from '@nestjs/testing';
import { BoardService } from '../../../src/routes/board/board.service';
import { Board, User } from '../../../src/entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StubBoardRepository } from './stub/board-repository';
import { NotFoundException } from '@nestjs/common';
import { StubUserRepository } from '../user/stub-repository';
import { BoardType } from '../../../src/common/enum/board.enum';
import { Role } from '../../../src/common/enum/user.enum';

describe('유저 게시판 관련 서비스 테스트', () => {
  let boardService: BoardService;
  let boardRepository: StubBoardRepository;
  let userRepository: StubUserRepository;
  const boardRepositoryToken = getRepositoryToken(Board);
  const userRepositoryToken = getRepositoryToken(User);

  beforeEach(async () => {
    boardRepository = new StubBoardRepository();
    userRepository = new StubUserRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardService,
        {
          provide: boardRepositoryToken,
          useValue: boardRepository,
        },
        {
          provide: userRepositoryToken,
          useValue: userRepository,
        },
      ],
    }).compile();

    boardService = module.get<BoardService>(BoardService);
  });

  describe('createBoard 함수 테스트', () => {
    it('createBoard 함수 결과값 테스트', async () => {
      // given
      const userId = 'test_user_id';
      const boardRowCount = boardRepository.boards.length;

      // when
      const result = await boardService.createBoard(userId, {
        title: 'board_title',
        description: 'board_description',
        boardType: BoardType.Free,
      });

      // then
      expect(result).toEqual({
        id: 'board-id',
        title: 'board_title',
        description: 'board_description',
        boardType: BoardType.Free,
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
      expect(boardRepository.boards.length).toBe(boardRowCount + 1);
      expect(boardRepository.boards).toContainEqual({
        id: 'board-id',
        title: 'board_title',
        description: 'board_description',
        boardType: BoardType.Free,
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
        boardService.createBoard(userId, {
          title: 'board_title',
          description: 'board_description',
          boardType: BoardType.Free,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateBoard 함수 테스트', () => {
    it('게시판 제목(title) 변경 시 updateBoard 함수 결과값 테스트', async () => {
      // given
      const boardId = 'board_test_id';
      boardRepository.boards.push({
        id: 'board_test_id',
        title: 'board_title',
        description: 'board_description',
        boardType: BoardType.Free,
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
      });
      const boardRowCount = boardRepository.boards.length;

      // when
      const result = await boardService.updateBoard(boardId, {
        title: 'new_board_title',
      });

      // then
      expect(result).toEqual({
        id: 'board_test_id',
        title: 'new_board_title',
        description: 'board_description',
        boardType: BoardType.Free,
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
      });
      expect(boardRepository.boards.length).toBe(boardRowCount);
      expect(boardRepository.boards).toContainEqual({
        id: 'board_test_id',
        title: 'new_board_title',
        description: 'board_description',
        boardType: BoardType.Free,
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
      });
    });

    it('게시판 설명(description) 변경 시 updateBoard 함수 결과값 테스트', async () => {
      // given
      const boardId = 'board_test_id';
      boardRepository.boards.push({
        id: 'board_test_id',
        title: 'board_title',
        description: 'board_description',
        boardType: BoardType.Free,
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
      });
      const boardRowCount = boardRepository.boards.length;

      // when
      const result = await boardService.updateBoard(boardId, {
        description: 'new_board_description',
      });

      // then
      expect(result).toEqual({
        id: 'board_test_id',
        title: 'board_title',
        description: 'new_board_description',
        boardType: BoardType.Free,
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
      });
      expect(boardRepository.boards.length).toBe(boardRowCount);
      expect(boardRepository.boards).toContainEqual({
        id: 'board_test_id',
        title: 'board_title',
        description: 'new_board_description',
        boardType: BoardType.Free,
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
      });
    });

    it('boardId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const boardId = 'invalid-board-id';
      const newBoard = {
        title: 'new_board_title',
      };

      // then
      expect(boardService.updateBoard(boardId, newBoard)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteBoard 함수 테스트', () => {
    it('deleteBoard 함수 결과값 테스트', async () => {
      // given
      const boardId = 'board_test_id';
      boardRepository.boards.push({
        id: 'board_test_id',
        title: 'board_title',
        description: 'board_description',
        boardType: BoardType.Free,
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
      });
      const boardRowCount = boardRepository.boards.length;

      // when
      const result = await boardService.deleteBoard(boardId);

      // then
      expect(result).toEqual({
        id: 'board_test_id',
        title: 'board_title',
        description: 'board_description',
        boardType: BoardType.Free,
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
      });
      expect(boardRepository.boards.length).toBe(boardRowCount - 1);
      expect(boardRepository.boards).not.toContainEqual({
        id: 'board_test_id',
        title: 'board_title',
        description: 'board_description',
        boardType: BoardType.Free,
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
      });
    });

    it('boardId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const boardId = 'invalid-board-id';

      // then
      expect(boardService.deleteBoard(boardId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
