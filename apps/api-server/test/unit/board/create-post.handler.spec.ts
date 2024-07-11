import { Test, TestingModule } from '@nestjs/testing';
import { CreatePostHandler } from './../../../src/routes/board/post/handler/create-post.handler';
import { CreatePostCommand } from '../../../src/routes/board/post/command/create-post.command';
import { EventBus } from '@nestjs/cqrs';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { User, BoardPost, Board } from '../../../src/entity';
import { PostCreatedEvent } from '../../../src/routes/board/post/event/post-created.event';
import { mock, instance, when, verify, deepEqual, anything } from 'ts-mockito';

describe('CreatePostHandler', () => {
  let handler: CreatePostHandler;
  let mockDataSource: DataSource;
  let mockEventBus: EventBus;
  let mockQueryRunner: QueryRunner;
  let mockManager: EntityManager;

  beforeEach(async () => {
    mockDataSource = mock(DataSource);
    mockEventBus = mock(EventBus);
    mockQueryRunner = mock<QueryRunner>();
    mockManager = mock(EntityManager);

    when(mockDataSource.createQueryRunner()).thenReturn(
      instance(mockQueryRunner),
    );
    when(mockQueryRunner.manager).thenReturn(instance(mockManager));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePostHandler,
        {
          provide: DataSource,
          useValue: instance(mockDataSource),
        },
        {
          provide: EventBus,
          useValue: instance(mockEventBus),
        },
      ],
    }).compile();

    handler = module.get<CreatePostHandler>(CreatePostHandler);
  });

  it('Post 생성(create) 테스트', async () => {
    const command = new CreatePostCommand(
      'user-id',
      'Test Title',
      'Test Contents',
      0,
      'board-id',
      false,
    );

    const user = new User();
    user.id = 'user-id';
    const board = new Board();
    board.id = 'board-id';

    const post = new BoardPost();
    post.id = 'post-id';
    post.title = command.title;
    post.contents = command.contents;
    post.views = command.views;
    post.board = board;
    post.anonymity = command.anonymity;
    post.user = user;

    when(
      mockManager.findOne(User, deepEqual({ where: { id: 'user-id' } })),
    ).thenResolve(user);
    when(
      mockManager.findOne(Board, deepEqual({ where: { id: 'board-id' } })),
    ).thenResolve(board);
    when(
      mockManager.create(
        BoardPost,
        deepEqual({
          title: 'Test Title',
          contents: 'Test Contents',
          views: 0,
          board,
          anonymity: false,
          user,
        }),
      ),
    ).thenReturn(post);
    when(mockManager.save(post)).thenResolve(post);

    when(mockQueryRunner.startTransaction()).thenResolve();
    when(mockQueryRunner.commitTransaction()).thenResolve();
    when(mockQueryRunner.rollbackTransaction()).thenResolve();
    when(mockQueryRunner.release()).thenResolve();

    const result = await handler.execute(command);

    expect(result).toEqual(post);
    verify(
      mockManager.findOne(User, deepEqual({ where: { id: 'user-id' } })),
    ).once();
    verify(
      mockManager.findOne(Board, deepEqual({ where: { id: 'board-id' } })),
    ).once();
    verify(
      mockManager.create(
        BoardPost,
        deepEqual({
          title: 'Test Title',
          contents: 'Test Contents',
          views: 0,
          board,
          anonymity: false,
          user,
        }),
      ),
    ).once();
    verify(mockManager.save(post)).once();
    verify(mockQueryRunner.startTransaction()).once();
    verify(mockQueryRunner.commitTransaction()).once();
    verify(mockQueryRunner.release()).once();
    verify(
      mockEventBus.publish(deepEqual(new PostCreatedEvent('post-id'))),
    ).once();
  });

  it('에러가 발생하면 롤백 트랜잭션이 실행됩니다', async () => {
    const command = new CreatePostCommand(
      'user-id',
      'Test Title',
      'Test Contents',
      0,
      'board-id',
      false,
    );

    when(
      mockManager.findOne(User, deepEqual({ where: { id: 'user-id' } })),
    ).thenResolve(new User());
    when(
      mockManager.findOne(Board, deepEqual({ where: { id: 'board-id' } })),
    ).thenResolve(new Board());
    when(mockManager.save(anything())).thenReject(new Error('Test Error'));

    when(mockQueryRunner.startTransaction()).thenResolve();
    when(mockQueryRunner.rollbackTransaction()).thenResolve();
    when(mockQueryRunner.release()).thenResolve();

    await expect(handler.execute(command)).rejects.toThrow('Test Error');
    verify(mockQueryRunner.startTransaction()).once();
    verify(mockQueryRunner.rollbackTransaction()).once();
    verify(mockQueryRunner.release()).once();
  });
});
