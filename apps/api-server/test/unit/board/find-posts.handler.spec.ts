import { Test, TestingModule } from '@nestjs/testing';
import { FindPostsQueryHandler } from './../../../src/routes/board/post/handler/find-posts.handler';
import { FindPostsQuery } from '../../../src/routes/board/post/query/find-posts.query';
import { BoardPost } from '../../../src/entity/board-post.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock, instance, when, verify, deepEqual } from 'ts-mockito';

describe('FindPostsQueryHandler', () => {
  let handler: FindPostsQueryHandler;
  let mockBoardPostRepository: Repository<BoardPost>;

  beforeEach(async () => {
    mockBoardPostRepository = mock(Repository);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindPostsQueryHandler,
        {
          provide: getRepositoryToken(BoardPost),
          useValue: instance(mockBoardPostRepository),
        },
      ],
    }).compile();

    handler = module.get<FindPostsQueryHandler>(FindPostsQueryHandler);
  });

  it('paginated posts GET 테스트', async () => {
    const posts = [
      {
        id: 'post-1',
        title: 'Post 1',
        contents: 'Content 1',
        user: { id: 'user-1' },
      },
      {
        id: 'post-2',
        title: 'Post 2',
        contents: 'Content 2',
        user: { id: 'user-2' },
      },
    ] as BoardPost[];

    when(
      mockBoardPostRepository.find(
        deepEqual({
          relations: ['user'],
          skip: 0,
          take: 2,
        }),
      ),
    ).thenResolve(posts);

    const query = new FindPostsQuery(1, 2);
    const result = await handler.execute(query);

    expect(result).toEqual(posts);
    verify(
      mockBoardPostRepository.find(
        deepEqual({
          relations: ['user'],
          skip: 0,
          take: 2,
        }),
      ),
    ).once();
  });
});
