import { Test, TestingModule } from '@nestjs/testing';
import { FindPostsQueryHandler } from '../../../src/routes/board/post/handler/find-posts.handler';
import { FindPostsQuery } from '../../../src/routes/board/post/query/find-posts.query';
import { BoardPost } from '../../../src/entity/board-post.entity';
import { Board } from '../../../src/entity/board.entity';
import { Like, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock, instance, when, verify, deepEqual } from 'ts-mockito';
import { BoardType } from '../../../src/common/enum/board.enum';

describe('FindPostsQueryHandler', () => {
  let handler: FindPostsQueryHandler;
  let mockBoardPostRepository: Repository<BoardPost>;
  let mockBoardRepository: Repository<Board>;

  beforeEach(async () => {
    mockBoardPostRepository = mock(Repository);
    mockBoardRepository = mock(Repository);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindPostsQueryHandler,
        {
          provide: getRepositoryToken(BoardPost),
          useValue: instance(mockBoardPostRepository),
        },
        {
          provide: getRepositoryToken(Board),
          useValue: instance(mockBoardRepository),
        },
      ],
    }).compile();

    handler = module.get<FindPostsQueryHandler>(FindPostsQueryHandler);
  });

  it('검색(search) + board 필터 없을 때 paginated posts GET 테스트', async () => {
    const posts = [
      {
        id: 'post-1',
        title: 'Post 1',
        contents: 'Content 1',
        user: { id: 'user-1' },
        board: { id: 'board-1' },
      },
      {
        id: 'post-2',
        title: 'Post 2',
        contents: 'Content 2',
        user: { id: 'user-2' },
        board: { id: 'board-2' },
      },
    ] as BoardPost[];
    const total = 2;

    when(
      mockBoardPostRepository.findAndCount(
        deepEqual({
          where: {},
          relations: ['user', 'board'],
          skip: 0,
          take: 2,
          order: { createdAt: 'DESC' },
        }),
      ),
    ).thenResolve([posts, total]);

    const query = new FindPostsQuery(1, 2);
    const result = await handler.execute(query);

    expect(result).toEqual({ posts, total });
    verify(
      mockBoardPostRepository.findAndCount(
        deepEqual({
          where: {},
          relations: ['user', 'board'],
          skip: 0,
          take: 2,
          order: { createdAt: 'DESC' },
        }),
      ),
    ).once();
  });

  it('검색(search) + board 필터 둘 다 있을 때 paginated posts GET 테스트', async () => {
    const query = new FindPostsQuery(1, 10, 'test', BoardType.Free);
    const boardEntity = { id: 'board-1', boardType: BoardType.Free } as Board;
    const posts = [
      {
        id: 'post-1',
        title: 'Post 1',
        contents: 'Content 1',
        user: { id: 'user-1' },
        board: { id: 'board-1', boardType: BoardType.Free },
      },
      {
        id: 'post-2',
        title: 'Post 2',
        contents: 'Content 2',
        user: { id: 'user-2' },
        board: { id: 'board-1', boardType: BoardType.Free },
      },
    ] as BoardPost[];
    const total = 2;

    when(
      mockBoardRepository.findOne(
        deepEqual({ where: { boardType: BoardType.Free } }),
      ),
    ).thenResolve(boardEntity);
    when(
      mockBoardPostRepository.findAndCount(
        deepEqual({
          where: {
            board: { id: boardEntity.id },
            title: Like('%test%'),
            contents: Like('%test%'),
          },
          relations: ['user', 'board'],
          skip: 0,
          take: 10,
          order: { createdAt: 'DESC' },
        }),
      ),
    ).thenResolve([posts, total]);

    const result = await handler.execute(query);

    expect(result).toEqual({ posts, total });
    verify(
      mockBoardRepository.findOne(
        deepEqual({ where: { boardType: BoardType.Free } }),
      ),
    ).once();
    verify(
      mockBoardPostRepository.findAndCount(
        deepEqual({
          where: {
            board: { id: boardEntity.id },
            title: Like('%test%'),
            contents: Like('%test%'),
          },
          relations: ['user', 'board'],
          skip: 0,
          take: 10,
          order: { createdAt: 'DESC' },
        }),
      ),
    ).once();
  });

  it('검색(search) 없고 board 필터는 ALL일 때 paginated posts GET 테스트', async () => {
    const query = new FindPostsQuery(1, 10, undefined, BoardType.All);
    const posts = [new BoardPost(), new BoardPost()] as BoardPost[];
    const total = 2;

    when(
      mockBoardPostRepository.findAndCount(
        deepEqual({
          where: {},
          relations: ['user', 'board'],
          skip: 0,
          take: 10,
          order: { createdAt: 'DESC' },
        }),
      ),
    ).thenResolve([posts, total]);

    const result = await handler.execute(query);

    expect(result).toEqual({ posts, total });
    verify(
      mockBoardPostRepository.findAndCount(
        deepEqual({
          where: {},
          relations: ['user', 'board'],
          skip: 0,
          take: 10,
          order: { createdAt: 'DESC' },
        }),
      ),
    ).once();
  });
});
