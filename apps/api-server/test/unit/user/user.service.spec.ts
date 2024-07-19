import { getRepositoryToken } from '@nestjs/typeorm';
import { User, Follow } from '../../../src/entity';
import { UserService } from '../../../src/routes/user/user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { StubUserRepository } from './stub-repository';
import { StubFollowRepository } from './follow-repository';
import { UserType } from '../../../src/common/enum/user.enum';
import { NotFoundException } from '@nestjs/common';

describe('유저 서비스 테스트', () => {
  let userService: UserService;
  let userRepository: StubUserRepository;
  let followRepository: StubFollowRepository;

  const leaderId = 'test_leader_id';
  const followerId = 'test_follower_id';

  beforeEach(async () => {
    userRepository = new StubUserRepository();
    followRepository = new StubFollowRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: getRepositoryToken(Follow),
          useValue: followRepository,
        },
      ],
    }).compile();

    userRepository.users.push({
      id: 'test_leader_id',
      email: 'test_email',
      password: 'test_password',
      role: UserType.User.text,
      username: 'test_name',
      createdAt: new Date('2024-06-28T18:19:29.764Z'),
      updateAt: new Date('2024-06-28T18:19:29.764Z'),
      postCount: 0,
    });
    userRepository.users.push({
      id: 'test_follower_id',
      email: 'test_email',
      password: 'test_password',
      role: UserType.User.text,
      username: 'test_name',
      createdAt: new Date('2024-06-28T18:19:29.764Z'),
      updateAt: new Date('2024-06-28T18:19:29.764Z'),
      postCount: 0,
    });

    userService = module.get<UserService>(UserService);
  });

  describe('createFollow 함수 테스트', () => {
    it('createFollow 함수 결과값 테스트', async () => {
      // given
      const followRowCount = followRepository.follows.length;

      // when
      const result = await userService.createFollow(leaderId, followerId);

      // then
      expect(result).toEqual({
        id: 'follow-id',
        fk_leader_id: leaderId,
        fk_follower_id: followerId,
      });
      expect(followRepository.follows.length).toBe(followRowCount + 1);
      expect(followRepository.follows).toContainEqual({
        id: 'follow-id',
        fk_leader_id: leaderId,
        fk_follower_id: followerId,
      });
    });

    it('leaderId 혹은 followerId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const invalidLeaderId = 'invalid_leader_id';
      const invalidFollowerId = 'invalid_follower_id';

      // then
      expect(
        userService.createFollow(invalidLeaderId, invalidFollowerId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getFollower 함수 테스트', () => {
    it('getFollower 함수 결과값 테스트', async () => {
      // given
      await userService.createFollow(leaderId, followerId);

      // when
      const result = await userService.getFollower(leaderId);

      // then
      expect(result).toEqual({
        count: 1,
        followers: ['test_follower_id'],
      });
    });

    it('leaderId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const invalidLeaderId = 'invalid_leader_id';

      // then
      expect(userService.getFollower(invalidLeaderId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteFollow 함수 테스트', () => {
    it('deleteFollow 함수 결과값 테스트', async () => {
      // given
      await userService.createFollow(leaderId, followerId);
      const followRowCount = followRepository.follows.length;

      // when
      const result = await userService.removeFollow(leaderId, followerId);

      // then
      expect(result).toEqual({
        id: 'follow-id',
        fk_leader_id: leaderId,
        fk_follower_id: followerId,
      });
      expect(followRepository.follows.length).toBe(followRowCount - 1);
      expect(followRepository.follows).not.toContainEqual({
        id: 'follow-id',
        fk_leader_id: leaderId,
        fk_follower_id: followerId,
      });
    });

    it('leaderId 혹은 followerId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const invalidLeaderId = 'invalid_leader_id';
      const invalidFollowerId = 'invalid_follower_id';

      // then
      expect(
        userService.removeFollow(invalidLeaderId, invalidFollowerId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
