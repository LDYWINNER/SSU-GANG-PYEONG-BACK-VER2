import { HttpException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from '../../../src/routes/board/post/post.service';
import { UpdatePostDto } from '../../../src/routes/board/post/dto/update-post.dto';
import { StubBoardPostRepository } from './stub/post-repository';
import { UserType } from '../../../src/common/enum/user.enum';
import { BoardPost, BoardPostLike } from '../../../src/entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StubBoardRepository } from './stub/board-repository';
import { BoardType } from '../../../src/common/enum/board.enum';
import { StubBoardPostLikeRepository } from './stub/board-post-like-repository';

describe('cqrs 구조 제외한 나머지 board post 서비스 테스트', () => {
  let service: PostService;
  let boardRepository: StubBoardRepository;
  let boardPostRepository: StubBoardPostRepository;
  let boardPostLikeRepository: StubBoardPostLikeRepository;
  const boardPostRepositoryToken = getRepositoryToken(BoardPost);
  const boardPostLikeRepositoryToken = getRepositoryToken(BoardPostLike);

  beforeEach(async () => {
    boardRepository = new StubBoardRepository();
    boardPostRepository = new StubBoardPostRepository();
    boardPostLikeRepository = new StubBoardPostLikeRepository();

    boardRepository.boards.push({
      id: 'board_id',
      title: 'board_title',
      description: 'board_description',
      createdAt: undefined,
      updatedAt: undefined,
      user: {
        id: 'user-1',
        username: '',
        email: '',
        password: '',
        role: UserType.User,
        postCount: 0,
        createdAt: undefined,
        updateAt: undefined,
      },
      boardType: BoardType.All,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: boardPostRepositoryToken,
          useValue: boardPostRepository,
        },
        {
          provide: boardPostLikeRepositoryToken,
          useValue: boardPostLikeRepository,
        },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
  });

  describe('findTop5Download 함수 테스트', () => {
    it('findTop5Download 함수 결과값 테스트', async () => {
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
          role: UserType.User,
          postCount: 0,
          createdAt: undefined,
          updateAt: undefined,
        },
        anonymity: false,
        createdAt: undefined,
        updateAt: undefined,
        board: boardRepository.boards[0],
        likes: 0,
      });
      boardPostRepository.boardPosts.push({
        id: '2',
        title: 'Post 2',
        contents: 'Content 2',
        views: 20,
        anonymity: false,
        createdAt: undefined,
        updateAt: undefined,
        board: boardRepository.boards[0],
        user: {
          id: 'user-1',
          username: '',
          email: '',
          password: '',
          role: UserType.User,
          postCount: 0,
          createdAt: undefined,
          updateAt: undefined,
        },
        likes: 0,
      });
      boardPostRepository.boardPosts.push({
        id: '3',
        title: 'Post 3',
        contents: 'Content 3',
        views: 30,
        anonymity: false,
        createdAt: undefined,
        updateAt: undefined,
        board: boardRepository.boards[0],
        user: {
          id: 'user-1',
          username: '',
          email: '',
          password: '',
          role: UserType.User,
          postCount: 0,
          createdAt: undefined,
          updateAt: undefined,
        },
        likes: 0,
      });
      boardPostRepository.boardPosts.push({
        id: '4',
        title: 'Post 4',
        contents: 'Content 4',
        views: 40,
        anonymity: false,
        createdAt: undefined,
        updateAt: undefined,
        board: boardRepository.boards[0],
        user: {
          id: 'user-1',
          username: '',
          email: '',
          password: '',
          role: UserType.User,
          postCount: 0,
          createdAt: undefined,
          updateAt: undefined,
        },
        likes: 0,
      });
      boardPostRepository.boardPosts.push({
        id: '5',
        title: 'Post 5',
        contents: 'Content 5',
        views: 50,
        anonymity: false,
        createdAt: undefined,
        updateAt: undefined,
        board: boardRepository.boards[0],
        user: {
          id: 'user-1',
          username: '',
          email: '',
          password: '',
          role: UserType.User,
          postCount: 0,
          createdAt: undefined,
          updateAt: undefined,
        },
        likes: 0,
      });
      boardPostRepository.boardPosts.push({
        id: '6',
        title: 'Post 6',
        contents: 'Content 6',
        views: 60,
        anonymity: false,
        createdAt: undefined,
        updateAt: undefined,
        board: boardRepository.boards[0],
        user: {
          id: 'user-1',
          username: '',
          email: '',
          password: '',
          role: UserType.User,
          postCount: 0,
          createdAt: undefined,
          updateAt: undefined,
        },
        likes: 0,
      });

      const result = await service.findTop5Download();

      expect(result.length).toBe(5);
      expect(result[0].id).toBe('6');
      expect(result[4].id).toBe('2');
    });
  });

  describe('update 함수 테스트', () => {
    it('update 함수 결과값 테스트', async () => {
      const userId = 'user-1';
      const postId = '1';
      const updateDto: UpdatePostDto = { title: 'Updated Title' };

      boardPostRepository.boardPosts = [
        {
          id: postId,
          title: 'Original Title',
          contents: 'Original Content',
          views: 0,
          anonymity: false,
          createdAt: undefined,
          updateAt: undefined,
          board: boardRepository.boards[0],
          user: {
            id: 'user-1',
            username: '',
            email: '',
            password: '',
            role: UserType.User,
            postCount: 0,
            createdAt: undefined,
            updateAt: undefined,
          },
          likes: 0,
        },
      ];

      const result = await service.update(userId, postId, updateDto);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('title', updateDto.title);
    });

    it('postId에 해당하는 board post가 존재하지 않으면 에러가 납니다', async () => {
      const userId = 'user-1';
      const postId = 'non-existent-id';
      const updateDto: UpdatePostDto = { title: 'Updated Title' };

      await expect(service.update(userId, postId, updateDto)).rejects.toThrow(
        HttpException,
      );
    });

    it('userId에 해당하는 User가 존재하지 않으면 UnauthorizedException이 발생합니다', async () => {
      const userId = 'unauthorized-user';
      const postId = '1';
      const updateDto: UpdatePostDto = { title: 'Updated Title' };

      boardPostRepository.boardPosts = [
        {
          id: postId,
          title: 'Original Title',
          contents: 'Original Content',
          views: 0,
          anonymity: false,
          createdAt: undefined,
          updateAt: undefined,
          board: boardRepository.boards[0],
          user: {
            id: 'user-1',
            username: '',
            email: '',
            password: '',
            role: UserType.User,
            postCount: 0,
            createdAt: undefined,
            updateAt: undefined,
          },
          likes: 0,
        },
      ];

      await expect(service.update(userId, postId, updateDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('delete 함수 테스트', () => {
    it('delete 함수 결과값 테스트', async () => {
      const userId = 'user-1';
      const postId = '1';

      boardPostRepository.boardPosts = [
        {
          id: postId,
          title: 'Original Title',
          contents: 'Original Content',
          views: 0,
          anonymity: false,
          createdAt: undefined,
          updateAt: undefined,
          board: boardRepository.boards[0],
          user: {
            id: 'user-1',
            username: '',
            email: '',
            password: '',
            role: UserType.User,
            postCount: 0,
            createdAt: undefined,
            updateAt: undefined,
          },
          likes: 0,
        },
      ];

      const result = await service.delete(userId, postId);

      expect(result).toBeDefined();
    });

    it('postId에 해당하는 board post가 존재하지 않으면 에러가 납니다', async () => {
      const userId = 'user-1';
      const postId = 'non-existent-id';

      await expect(service.delete(userId, postId)).rejects.toThrow(
        HttpException,
      );
    });

    it('userId에 해당하는 User가 존재하지 않으면 UnauthorizedException이 발생합니다', async () => {
      const userId = 'unauthorized-user';
      const postId = '1';

      boardPostRepository.boardPosts = [
        {
          id: postId,
          title: 'Original Title',
          contents: 'Original Content',
          views: 0,
          anonymity: false,
          createdAt: undefined,
          updateAt: undefined,
          board: boardRepository.boards[0],
          user: {
            id: 'user-1',
            username: '',
            email: '',
            password: '',
            role: UserType.User,
            postCount: 0,
            createdAt: undefined,
            updateAt: undefined,
          },
          likes: 0,
        },
      ];

      await expect(service.delete(userId, postId)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('likeBoardPost & unlikeBoardPost & countLikes 함수 테스트', () => {
    const userId = 'user-1';
    const postId = '1';

    beforeEach(async () => {
      boardPostRepository.boardPosts = [
        {
          id: postId,
          title: 'Original Title',
          contents: 'Original Content',
          views: 0,
          anonymity: false,
          createdAt: undefined,
          updateAt: undefined,
          board: boardRepository.boards[0],
          user: {
            id: 'user-1',
            username: '',
            email: '',
            password: '',
            role: UserType.User,
            postCount: 0,
            createdAt: undefined,
            updateAt: undefined,
          },
          likes: 0,
        },
      ];
    });

    it('likeBoardPost 함수 테스트', async () => {
      // when
      const res = await service.likeBoardPost(userId, postId);

      // then
      expect(res).toEqual(
        expect.objectContaining({
          fk_user_id: userId,
          fk_board_post_id: postId,
        }),
      );
      expect(boardPostLikeRepository.boardPostLikes.length).toBe(1);
      expect(boardPostRepository.boardPosts[0].likes).toBe(1);
    });

    it('countLikes 함수 테스트', async () => {
      // given
      await service.likeBoardPost(userId, postId);

      // when
      const result = await service.countLikes(postId);

      // then
      expect(result).toEqual({
        count: 1,
      });
    });

    it('unlikeBoardPost 함수 테스트', async () => {
      // given
      await service.likeBoardPost(userId, postId);

      // when
      const res = await service.unlikeBoardPost(userId, postId);

      // then
      expect(res).toEqual(
        expect.objectContaining({
          fk_user_id: userId,
          fk_board_post_id: postId,
        }),
      );
      expect(boardPostLikeRepository.boardPostLikes.length).toBe(0);
      expect(boardPostRepository.boardPosts[0].likes).toBe(0);
    });
  });
});
