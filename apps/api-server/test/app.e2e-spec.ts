import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ApiServerModule } from '../src/api-server.module';

describe('e2e 테스트', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiServerModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('AppController', () => {
    it('/ (GET)', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });

    it('/name?name=ssu (GET)', () => {
      return request(app.getHttpServer())
        .get('/name?name=ssu')
        .expect(200)
        .expect('ssu hello');
    });

    it('[로그인]', () => {
      return request(app.getHttpServer())
        .post('/login')
        .send({
          username: 'seederUser2',
          password: 'hong123456',
        })
        .expect(201);
    });
  });

  describe('BoardController', () => {
    it('게시글 가져오기', () => {
      return request(app.getHttpServer()).get('/board').expect(200);
    });
  });

  describe('UserController', () => {});
});
