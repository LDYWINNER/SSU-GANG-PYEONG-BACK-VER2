import { ApiServerModule } from './../../src/api-server.module';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserModule } from '../../src/routes/user/user.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserType } from '../../src/common/enum/user.enum';
import { v4 as uuidv4 } from 'uuid';
import { User, RefreshToken, Follow } from '../../src/entity';

describe('User 기능 통합 테스트', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let refreshTokenRepository: Repository<RefreshToken>;
  let followRepository: Repository<Follow>;
  let leaderId: string;
  let followerId: string;
  let token: string;
  let invalidToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ApiServerModule,
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
    followRepository = moduleFixture.get<Repository<Follow>>(
      getRepositoryToken(Follow),
    );

    // 테스트용 사용자 생성
    const leader = userRepository.create({
      username: 'test_leader',
      email: 'test_leader@example.com',
      password: 'test_password',
      postCount: 0,
      role: UserType.User,
    });
    const follower = userRepository.create({
      username: 'test_follower',
      email: 'test_follower@example.com',
      password: 'test_password',
      postCount: 0,
      role: UserType.User,
    });
    await userRepository.save(leader);
    await userRepository.save(follower);
    leaderId = leader.id;
    followerId = follower.id;

    // JWT 토큰 발급
    const jwtService = moduleFixture.get<JwtService>(JwtService);
    token = jwtService.sign({ id: leaderId, username: leader.username });
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
    await followRepository.delete({});
    await refreshTokenRepository.delete({});
    await userRepository.delete({});
    await app.close();
  });

  describe('/user/follow (POST)', () => {
    afterEach(async () => {
      await followRepository.delete({});
    });

    it('follow 생성 테스트', async () => {
      const response = await request(app.getHttpServer())
        .post(`/user/follow/${followerId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          fk_leader_id: leaderId,
          fk_follower_id: followerId,
        }),
      );
    });

    it('유효하지 않은 토큰으로 요청을 보내는 경우 401를 반환해야 합니다', async () => {
      const response = await request(app.getHttpServer())
        .post(`/user/follow/${followerId}`)
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(response.status).toBe(401);
    });
  });

  describe('/user/follow/:id (GET)', () => {
    beforeAll(async () => {
      const follow = followRepository.create({
        fk_leader_id: leaderId,
        fk_follower_id: followerId,
      });
      await followRepository.save(follow);
    });

    afterAll(async () => {
      await followRepository.delete({});
    });

    it('follower 불러오기 테스트', async () => {
      const response = await request(app.getHttpServer())
        .get(`/user/follow/${leaderId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        count: 1,
        followers: [followerId],
      });
    });

    it('유효하지 않은 팔로우 객체 아이디로 수정 요청을 보내면 404를 반환해야 합니다', async () => {
      const invalidLeaderId = uuidv4();

      const response = await request(app.getHttpServer())
        .get(`/user/follow/${invalidLeaderId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('/user/follow (DELETE)', () => {
    beforeAll(async () => {
      const follow = followRepository.create({
        fk_leader_id: leaderId,
        fk_follower_id: followerId,
      });
      await followRepository.save(follow);
    });

    afterAll(async () => {
      await followRepository.delete({});
    });

    it('follow 취소 테스트', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/user/follow/${followerId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          fk_leader_id: leaderId,
          fk_follower_id: followerId,
        }),
      );
      const deletedFollow = await followRepository.findOneBy({
        fk_leader_id: leaderId,
        fk_follower_id: followerId,
      });
      expect(deletedFollow).toBeNull();
    });

    it('유효하지 않은 팔로워 아이디로 삭제 요청을 보내면 404를 반환해야 합니다', async () => {
      const invalidFollowerId = uuidv4();

      const response = await request(app.getHttpServer())
        .delete(`/user/follow/${invalidFollowerId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });
});
