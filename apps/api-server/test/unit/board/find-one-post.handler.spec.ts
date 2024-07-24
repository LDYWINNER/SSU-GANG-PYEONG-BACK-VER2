import { Test, TestingModule } from '@nestjs/testing';
import { FindOnePostQueryHandler } from './../../../src/routes/board/post/handler/find-one-post.handler';
import { FindOnePostQuery } from '../../../src/routes/board/post/query/find-one-post.query';
import { BoardPost } from '../../../src/entity/board-post.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException } from '@nestjs/common';
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
    const postId = 'post-1';
    const post = {
      id: postId,
      title: 'Post 1',
      contents: 'Content 1',
      user: { id: 'user-1' },
      views: 5,
    } as BoardPost;

    when(
      mockBoardPostRepository.findOne(
        deepEqual({
          where: { id: postId },
          relations: ['user', 'comments'],
        }),
      ),
    ).thenResolve(post);

    when(mockBoardPostRepository.update(postId, { views: 6 })).thenResolve();

    const query = new FindOnePostQuery(postId);
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
    verify(
      mockBoardPostRepository.update(
        deepEqual('post-1'),
        deepEqual({ views: 6 }),
      ),
    ).once();
  });

  it('post GET에 실패하면 not found 에러가 납니다', async () => {
    const postId = 'post-1';

    when(
      mockBoardPostRepository.findOne(
        deepEqual({
          where: { id: postId },
          relations: ['user', 'comments'],
        }),
      ),
    ).thenResolve(null);

    const query = new FindOnePostQuery(postId);
    await expect(handler.execute(query)).rejects.toThrow(HttpException);

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
