import { Test, TestingModule } from '@nestjs/testing';
import { FindOnePostQueryHandler } from '../../../src/routes/board/post/handler/find-one-post.handler';
import { FindOnePostQuery } from '../../../src/routes/board/post/query/find-one-post.query';
import { BoardPost } from '../../../src/entity/board-post.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock, instance, when, verify, deepEqual } from 'ts-mockito';

describe('FindOnePostQueryHandler', () => {
  let handler: FindOnePostQueryHandler;
  let mockBoardPostRepository: Repository<BoardPost>;

  beforeEach(async () => {
    mockBoardPostRepository = mock(Repository);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindOnePostQueryHandler,
        {
          provide: getRepositoryToken(BoardPost),
          useValue: instance(mockBoardPostRepository),
        },
      ],
    }).compile();

    handler = module.get<FindOnePostQueryHandler>(FindOnePostQueryHandler);
  });

  it('post id로 GET 테스트', async () => {
    const post = {
      id: 'post-1',
      title: 'Post 1',
      contents: 'Content 1',
      user: { id: 'user-1' },
    } as BoardPost;

    when(
      mockBoardPostRepository.findOne(
        deepEqual({
          where: { id: 'post-1' },
          relations: ['user', 'comments'],
        }),
      ),
    ).thenResolve(post);

    const query = new FindOnePostQuery('post-1');
    const result = await handler.execute(query);

    expect(result).toEqual(post);
    verify(
      mockBoardPostRepository.findOne(
        deepEqual({
          where: { id: 'post-1' },
          relations: ['user', 'comments'],
        }),
      ),
    ).once();
  });
});
