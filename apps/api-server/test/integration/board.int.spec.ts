import { ApiServerModule } from './../../src/api-server.module';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardModule } from './../../src/routes/board/board.module';
import { UserModule } from '../../src/routes/user/user.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserType } from '../../src/common/enum/user.enum';
import { v4 as uuidv4 } from 'uuid';
import {
  User,
  Board,
  BoardPost,
  BoardComment,
  RefreshToken,
  BoardCommentLike,
  BoardPostLike,
} from '../../src/entity';
import { BoardType } from '../../src/common/enum/board.enum';

describe('Board 기능 통합 테스트', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let refreshTokenRepository: Repository<RefreshToken>;
  let boardRepository: Repository<Board>;
  let boardPostRepository: Repository<BoardPost>;
  let boardCommentRepository: Repository<BoardComment>;
  let boardCommentLikeRepository: Repository<BoardCommentLike>;
  let boardPostLikeRepository: Repository<BoardPostLike>;
  let userId: string;
  let token: string;
  let invalidToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ApiServerModule,
        BoardModule,
        UserModule,
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            secret: configService.get<string>('jwt.secret'),
            signOptions: { expiresIn: '60m' },
          }),
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    refreshTokenRepository = moduleFixture.get<Repository<RefreshToken>>(
      getRepositoryToken(RefreshToken),
    );
    boardRepository = moduleFixture.get<Repository<Board>>(
      getRepositoryToken(Board),
    );
    boardPostRepository = moduleFixture.get<Repository<BoardPost>>(
      getRepositoryToken(BoardPost),
    );
    boardCommentRepository = moduleFixture.get<Repository<BoardComment>>(
      getRepositoryToken(BoardComment),
    );
    boardCommentLikeRepository = moduleFixture.get<
      Repository<BoardCommentLike>
    >(getRepositoryToken(BoardCommentLike));
    boardPostLikeRepository = moduleFixture.get<Repository<BoardPostLike>>(
      getRepositoryToken(BoardPostLike),
    );

    // 테스트용 사용자 생성
    const user = userRepository.create({
      username: 'test_user',
      email: 'test_user@example.com',
      password: 'test_password',
      postCount: 0,
      role: UserType.User,
    });
    await userRepository.save(user);
    userId = user.id;

    // JWT 토큰 발급
    const jwtService = moduleFixture.get<JwtService>(JwtService);
    token = jwtService.sign({ id: userId, username: user.username });
    // Invalid JWT 토큰 발급
    const invalidSecret = 'some-invalid-secret';
    const invalidPayload = {
      id: 'invalid-uuid',
      username: 'invalidUser',
      email: 'invalid@example.com',
    };
    invalidToken = jwtService.sign(invalidPayload, { secret: invalidSecret });
  });

  afterAll(async () => {
    // 테스트 이후에 생성된 데이터 정리
    await boardRepository.delete({});
    await boardPostRepository.delete({});
    await boardCommentRepository.delete({});
    await boardPostLikeRepository.delete({});
    await boardCommentLikeRepository.delete({});
    await refreshTokenRepository.delete({});
    await userRepository.delete({});
    await app.close();
  });

  describe('/board (POST)', () => {
    afterEach(async () => {
      await boardRepository.delete({});
    });

    it('board 생성 테스트', async () => {
      const response = await request(app.getHttpServer())
        .post('/board')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'board_title',
          description: 'board_description',
          boardType: BoardType.Free,
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title: 'board_title',
          description: 'board_description',
          boardType: BoardType.Free,
          user: expect.objectContaining({
            id: userId,
            username: 'test_user',
            email: 'test_user@example.com',
          }),
        }),
      );
    });

    it('유효하지 않은 토큰으로 요청을 보내는 경우 401를 반환해야 합니다', async () => {
      const response = await request(app.getHttpServer())
        .post('/board')
        .set('Authorization', `Bearer ${invalidToken}`)
        .send({
          title: 'board_title',
          description: 'board_description',
          boardType: BoardType.Free,
        });

      expect(response.status).toBe(401);
    });
  });

  describe('/board/:id (PUT)', () => {
    let boardId: string;

    beforeEach(async () => {
      const board = boardRepository.create({
        title: 'board_title',
        description: 'board_description',
        boardType: BoardType.Free,
        user: { id: userId },
      });
      const savedBoard = await boardRepository.save(board);
      boardId = savedBoard.id;
    });

    afterEach(async () => {
      await boardRepository.delete({});
    });

    it('board title 수정 테스트', async () => {
      const newTitle = 'updated_board';
      const response = await request(app.getHttpServer())
        .put(`/board/${boardId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: newTitle });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: boardId,
          title: newTitle,
          description: 'board_description',
          boardType: BoardType.Free,
          user: expect.objectContaining({
            id: userId,
          }),
        }),
      );
    });

    it('board description 수정 테스트', async () => {
      const newDescription = 'updated_board_description';
      const response = await request(app.getHttpServer())
        .put(`/board/${boardId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ description: newDescription });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: boardId,
          title: 'board_title',
          description: newDescription,
          boardType: BoardType.Free,
          user: expect.objectContaining({
            id: userId,
          }),
        }),
      );
    });

    it('유효하지 않은 게시판 아이디로 수정 요청을 보내면 404를 반환해야 합니다', async () => {
      const invalidBoardId = uuidv4();
      const newTitle = 'updated_board';

      const response = await request(app.getHttpServer())
        .put(`/board/${invalidBoardId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: newTitle });

      expect(response.status).toBe(404);
    });
  });

  describe('/board/:id (DELETE)', () => {
    let boardId: string;

    beforeEach(async () => {
      const board = boardRepository.create({
        title: 'board_title',
        description: 'board_description',
        boardType: BoardType.Free,
        user: { id: userId },
      });
      const savedBoard = await boardRepository.save(board);
      boardId = savedBoard.id;
    });

    afterEach(async () => {
      await boardRepository.delete({});
    });

    it('board 삭제 테스트', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/board/${boardId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          title: 'board_title',
          description: 'board_description',
          boardType: BoardType.Free,
        }),
      );
      const deletedBoard = await boardRepository.findOneBy({ id: boardId });
      expect(deletedBoard).toBeNull();
    });

    it('board post와 board comment가 있는 경우 table 삭제 테스트(CASCADE)', async () => {
      const boardPost = boardPostRepository.create({
        title: 'post_title',
        contents: 'post_contents',
        views: 0,
        board: { id: boardId },
        user: { id: userId },
      });
      const savedBoardPost = await boardPostRepository.save(boardPost);
      const boardPostId = savedBoardPost.id;
      const boardComment = boardCommentRepository.create({
        content: 'comment_content',
        boardPost: { id: boardPostId },
        user: { id: userId },
      });
      const savedBoardComment = await boardCommentRepository.save(boardComment);
      const boardCommentId = savedBoardComment.id;

      const response = await request(app.getHttpServer())
        .delete(`/board/${boardId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      const deletedBoard = await boardRepository.findOneBy({ id: boardId });
      expect(deletedBoard).toBeNull();
      const deletedBoardPost = await boardPostRepository.findOneBy({
        id: boardPostId,
      });
      expect(deletedBoardPost).toBeNull();
      const deletedBoardComment = await boardCommentRepository.findOneBy({
        id: boardCommentId,
      });
      expect(deletedBoardComment).toBeNull();
    });

    it('유효하지 않은 게시판 아이디로 삭제 요청을 보내면 404를 반환해야 합니다', async () => {
      const invalidBoardId = uuidv4();

      const response = await request(app.getHttpServer())
        .delete(`/board/${invalidBoardId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('게시판 게시글(board post) 기능 통합 테스트', () => {
    let boardId: string;

    beforeAll(async () => {
      const board = boardRepository.create({
        title: 'board_title',
        description: 'board_description',
        boardType: BoardType.Free,
        user: { id: userId },
      });
      const savedBoard = await boardRepository.save(board);
      boardId = savedBoard.id;
    });

    afterAll(async () => {
      await boardRepository.delete({});
    });

    describe('/board/post (POST)', () => {
      afterEach(async () => {
        await boardPostRepository.delete({});
      });

      it('board post 생성 테스트', async () => {
        const response = await request(app.getHttpServer())
          .post('/board/post')
          .set('Authorization', `Bearer ${token}`)
          .send({
            boardId,
            title: 'post_title',
            contents: 'post_contents',
            anonymity: false,
          });

        expect(response.status).toBe(201);
        expect(response.body).toEqual(
          expect.objectContaining({
            title: 'post_title',
            contents: 'post_contents',
            anonymity: false,
            board: expect.objectContaining({
              id: boardId,
            }),
          }),
        );
      });

      it('유효하지 않은 토큰으로 요청을 보내는 경우 401를 반환해야 합니다', async () => {
        const response = await request(app.getHttpServer())
          .post('/board/post')
          .set('Authorization', `Bearer ${invalidToken}`)
          .send({
            boardId,
            title: 'post_title',
            contents: 'post_contents',
            anonymity: false,
          });

        expect(response.status).toBe(401);
      });
    });

    describe('/board/post/:id (PUT)', () => {
      let boardPostId: string;

      beforeEach(async () => {
        const boardPost = boardPostRepository.create({
          title: 'post_title',
          contents: 'post_contents',
          views: 0,
          anonymity: true,
          board: { id: boardId },
          user: { id: userId },
        });
        const savedBoardPost = await boardPostRepository.save(boardPost);
        boardPostId = savedBoardPost.id;
      });

      afterEach(async () => {
        await boardPostRepository.delete({});
      });

      it('board post title 수정 테스트', async () => {
        const response = await request(app.getHttpServer())
          .put(`/board/post/${boardPostId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ title: 'updated_post_title' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
          expect.objectContaining({
            title: 'updated_post_title',
            contents: 'post_contents',
            views: 0,
            board: expect.objectContaining({
              id: boardId,
            }),
            user: expect.objectContaining({
              id: userId,
            }),
          }),
        );
      });

      it('board post contents 수정 테스트', async () => {
        const response = await request(app.getHttpServer())
          .put(`/board/post/${boardPostId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({
            contents: 'updated_post_contents',
          });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
          expect.objectContaining({
            title: 'post_title',
            contents: 'updated_post_contents',
            views: 0,
            board: expect.objectContaining({
              id: boardId,
            }),
            user: expect.objectContaining({
              id: userId,
            }),
          }),
        );
      });

      it('유효하지 않은 board post 아이디로 삭제 요청을 보내면 404를 반환해야 합니다', async () => {
        const invalidBoardPostId = uuidv4();

        const response = await request(app.getHttpServer())
          .put(`/board/post/${invalidBoardPostId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ title: 'updated_post_title' });

        expect(response.status).toBe(404);
      });
    });

    describe('/board/post/:id (DELETE)', () => {
      let boardPostId: string;

      beforeEach(async () => {
        const boardPost = boardPostRepository.create({
          title: 'post_title',
          contents: 'post_contents',
          views: 0,
          board: { id: boardId },
          user: { id: userId },
        });
        const savedBoardPost = await boardPostRepository.save(boardPost);
        boardPostId = savedBoardPost.id;
      });

      afterEach(async () => {
        await boardPostRepository.delete({});
      });

      it('board post 삭제 테스트', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/board/post/${boardPostId}`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
          expect.objectContaining({
            title: 'post_title',
            contents: 'post_contents',
            views: 0,
          }),
        );
        const deletedBoardPost = await boardPostRepository.findOneBy({
          id: boardPostId,
        });
        expect(deletedBoardPost).toBeNull();
      });

      it('유효하지 않은 board post 아이디로 삭제 요청을 보내면 404를 반환해야 합니다', async () => {
        const invalidBoardPostId = uuidv4();

        const response = await request(app.getHttpServer())
          .delete(`/board/post/${invalidBoardPostId}`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(404);
      });
    });

    describe('board post 좋아요 기능', () => {
      let boardPostId: string;

      beforeAll(async () => {
        const boardPost = boardPostRepository.create({
          title: 'post_title',
          contents: 'post_contents',
          views: 0,
          board: { id: boardId },
          user: { id: userId },
        });
        const savedBoardPost = await boardPostRepository.save(boardPost);
        boardPostId = savedBoardPost.id;
      });

      it('POST /board/post/like/:id - board post 좋아요 테스트', async () => {
        const response = await request(app.getHttpServer())
          .post(`/board/post/like/${boardPostId}`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(201);
        expect(response.body).toEqual(
          expect.objectContaining({
            fk_user_id: userId,
            fk_board_post_id: boardPostId,
          }),
        );
      });

      it('GET /board/post/like/:id - board post 좋아요 수 조회 테스트', async () => {
        const response = await request(app.getHttpServer())
          .get(`/board/post/like/${boardPostId}`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          count: 1,
        });
      });

      it('DELETE /board/post/like/:id - board post 좋아요 취소 테스트', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/board/post/like/${boardPostId}`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
          expect.objectContaining({
            fk_user_id: userId,
            fk_board_post_id: boardPostId,
          }),
        );
      });
    });
  });

  describe('게시판 게시글 댓글(board comment) 기능 통합 테스트', () => {
    let boardId: string;
    let boardPostId: string;

    beforeAll(async () => {
      const board = boardRepository.create({
        title: 'board_title',
        description: 'board_description',
        boardType: BoardType.Free,
        user: { id: userId },
      });
      const savedBoard = await boardRepository.save(board);
      boardId = savedBoard.id;

      const boardPost = boardPostRepository.create({
        title: 'post_title',
        contents: 'post_contents',
        views: 0,
        board: { id: boardId },
        user: { id: userId },
      });
      const savedBoardPost = await boardPostRepository.save(boardPost);
      boardPostId = savedBoardPost.id;
    });

    afterAll(async () => {
      await boardRepository.delete({});
      await boardPostRepository.delete({});
      await boardPostLikeRepository.delete({});
    });

    describe('/board/comment (POST)', () => {
      afterEach(async () => {
        await boardCommentRepository.delete({});
      });

      it('board comment 생성 테스트', async () => {
        const response = await request(app.getHttpServer())
          .post('/board/comment')
          .set('Authorization', `Bearer ${token}`)
          .send({
            boardPostId,
            content: 'comment_content',
          });

        expect(response.status).toBe(201);
        expect(response.body).toEqual(
          expect.objectContaining({
            content: 'comment_content',
          }),
        );
      });

      it('유효하지 않은 토큰으로 요청을 보내는 경우 401를 반환해야 합니다', async () => {
        const response = await request(app.getHttpServer())
          .post('/board/comment')
          .set('Authorization', `Bearer ${invalidToken}`)
          .send({
            boardPostId,
            content: 'comment_content',
          });

        expect(response.status).toBe(401);
      });
    });

    describe('/board/comment/:id (DELETE)', () => {
      let boardCommentId: string;

      beforeEach(async () => {
        const boardComment = boardCommentRepository.create({
          content: 'comment_content',
          boardPost: { id: boardPostId },
          user: { id: userId },
        });
        const savedBoardComment =
          await boardCommentRepository.save(boardComment);
        boardCommentId = savedBoardComment.id;
      });

      afterEach(async () => {
        await boardCommentRepository.delete({});
      });

      it('board comment 삭제 테스트', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/board/comment/${boardCommentId}`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
          expect.objectContaining({
            content: 'comment_content',
          }),
        );
        const deletedBoardComment = await boardCommentRepository.findOneBy({
          id: boardCommentId,
        });
        expect(deletedBoardComment).toBeNull();
      });

      it('유효하지 않은 board comment 아이디로 삭제 요청을 보내면 404를 반환해야 합니다', async () => {
        const invalidBoardCommentId = uuidv4();

        const response = await request(app.getHttpServer())
          .delete(`/board/comment/${invalidBoardCommentId}`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(404);
      });
    });

    describe('board comment 좋아요 기능', () => {
      let boardCommentId: string;

      beforeAll(async () => {
        const boardComment = boardCommentRepository.create({
          content: 'comment_content',
          boardPost: { id: boardPostId },
          user: { id: userId },
        });
        const savedBoardComment =
          await boardCommentRepository.save(boardComment);
        boardCommentId = savedBoardComment.id;
      });

      it('POST /board/comment/like/:id - board comment 좋아요 테스트', async () => {
        const response = await request(app.getHttpServer())
          .post(`/board/comment/like/${boardCommentId}`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(201);
        expect(response.body).toEqual(
          expect.objectContaining({
            fk_user_id: userId,
            fk_board_comment_id: boardCommentId,
          }),
        );
      });

      it('GET /board/comment/like/:id - board comment 좋아요 수 조회 테스트', async () => {
        const response = await request(app.getHttpServer())
          .get(`/board/comment/like/${boardCommentId}`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          count: 1,
        });
      });

      it('DELETE /board/comment/like/:id - board comment 좋아요 취소 테스트', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/board/comment/like/${boardCommentId}`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
          expect.objectContaining({
            fk_user_id: userId,
            fk_board_comment_id: boardCommentId,
          }),
        );
      });
    });
  });
});
