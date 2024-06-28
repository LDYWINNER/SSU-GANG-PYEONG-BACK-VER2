import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from '../../../src/routes/board/post/post.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BoardPost } from '../../../src/entity/board-post.entity';
import { Repository } from 'typeorm';

describe('BoardService', () => {
  let boardPostService: PostService;
  let boardPostRepository: Repository<BoardPost>;
  const boardPostRepositoryToken = getRepositoryToken(BoardPost);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: boardPostRepositoryToken,
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
          },
        },
      ],
    }).compile();

    boardPostService = module.get<PostService>(PostService);
    boardPostRepository = module.get<Repository<BoardPost>>(
      boardPostRepositoryToken,
    );
  });

  it('should be defined', () => {
    expect(boardPostService).toBeDefined();
  });

  it('boardRepository should be defined', () => {
    expect(boardPostRepository).toBeDefined();
  });

  // describe('게시글 조회', () => {
  //   it('2번 게시글의 작성자는 ssu 다', async () => {
  //     jest.spyOn(boardRepository, 'findOneBy').mockResolvedValue({
  //       id: 2,
  //       userId: 2,
  //       user: {
  //         id: 1,
  //         username: 'fakeuser',
  //         password: 'pw',
  //       },
  //       contents: '게시글',
  //     } as Board);
  //     const board = await boardService.getBoardById(2);

  //     expect(board.user.name).toBe('ssu');
  //   });
  // });
});
