import { getRepositoryToken } from '@nestjs/typeorm';
import { User, Follow, Block } from '../../../src/entity';
import { UserService } from '../../../src/routes/user/user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { StubUserRepository } from './stub-repository';
import { StubFollowRepository } from './follow-repository';
import { UserType } from '../../../src/common/enum/user.enum';
import { NotFoundException } from '@nestjs/common';
import { StubBlockRepository } from './block-repository';

describe('유저 서비스 테스트', () => {
  let userService: UserService;
  let userRepository: StubUserRepository;
  let followRepository: StubFollowRepository;
  let blockRepository: StubBlockRepository;

  const userId1 = 'test_user_id_1';
  const userId2 = 'test_user_id_2';

  beforeEach(async () => {
    userRepository = new StubUserRepository();
    followRepository = new StubFollowRepository();
    blockRepository = new StubBlockRepository();

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
        {
          provide: getRepositoryToken(Block),
          useValue: blockRepository,
        },
      ],
    }).compile();

    userRepository.users.push({
      id: 'test_user_id_1',
      email: 'test_email',
      password: 'test_password',
      role: UserType.User.text,
      username: 'test_name',
      createdAt: new Date('2024-06-28T18:19:29.764Z'),
      updateAt: new Date('2024-06-28T18:19:29.764Z'),
      courseReviewCount: 0,
    });
    userRepository.users.push({
      id: 'test_user_id_2',
      email: 'test_email',
      password: 'test_password',
      role: UserType.User.text,
      username: 'test_name',
      createdAt: new Date('2024-06-28T18:19:29.764Z'),
      updateAt: new Date('2024-06-28T18:19:29.764Z'),
      courseReviewCount: 0,
    });

    userService = module.get<UserService>(UserService);
  });

  describe('createFollow 함수 테스트', () => {
    it('createFollow 함수 결과값 테스트', async () => {
      // given
      const followRowCount = followRepository.follows.length;

      // when
      const result = await userService.createFollow(userId1, userId2);

      // then
      expect(result).toEqual({
        id: 'follow-id',
        fk_leader_id: userId1,
        fk_follower_id: userId2,
      });
      expect(followRepository.follows.length).toBe(followRowCount + 1);
      expect(followRepository.follows).toContainEqual({
        id: 'follow-id',
        fk_leader_id: userId1,
        fk_follower_id: userId2,
      });
    });

    it('userId1 혹은 userId2가 존재하지 않으면 에러가 납니다', () => {
      // given
      const invaliduserId1 = 'invalid_leader_id';
      const invaliduserId2 = 'invalid_follower_id';

      // then
      expect(
        userService.createFollow(invaliduserId1, invaliduserId2),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getFollower 함수 테스트', () => {
    it('getFollower 함수 결과값 테스트', async () => {
      // given
      await userService.createFollow(userId1, userId2);

      // when
      const result = await userService.getFollower(userId1);

      // then
      expect(result).toEqual({
        count: 1,
        followers: ['test_user_id_2'],
      });
    });

    it('userId1가 존재하지 않으면 에러가 납니다', () => {
      // given
      const invaliduserId1 = 'invalid_leader_id';

      // then
      expect(userService.getFollower(invaliduserId1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteFollow 함수 테스트', () => {
    it('deleteFollow 함수 결과값 테스트', async () => {
      // given
      await userService.createFollow(userId1, userId2);
      const followRowCount = followRepository.follows.length;

      // when
      const result = await userService.removeFollow(userId1, userId2);

      // then
      expect(result).toEqual({
        id: 'follow-id',
        fk_leader_id: userId1,
        fk_follower_id: userId2,
      });
      expect(followRepository.follows.length).toBe(followRowCount - 1);
      expect(followRepository.follows).not.toContainEqual({
        id: 'follow-id',
        fk_leader_id: userId1,
        fk_follower_id: userId2,
      });
    });

    it('userId1 혹은 userId2가 존재하지 않으면 에러가 납니다', () => {
      // given
      const invaliduserId1 = 'invalid_leader_id';
      const invaliduserId2 = 'invalid_follower_id';

      // then
      expect(
        userService.removeFollow(invaliduserId1, invaliduserId2),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('blockUser 함수 테스트', () => {
    it('blockUser 함수 결과값 테스트', async () => {
      // given
      const blockRowCount = blockRepository.blocks.length;

      // when
      const result = await userService.blockUser(userId1, userId2);

      // then
      expect(result).toEqual({
        id: 'block-id',
        fk_hater_id: userId1,
        fk_hated_id: userId2,
      });
      expect(blockRepository.blocks.length).toBe(blockRowCount + 1);
      expect(blockRepository.blocks).toContainEqual({
        id: 'block-id',
        fk_hater_id: userId1,
        fk_hated_id: userId2,
      });
    });

    it('userId1 혹은 userId2가 존재하지 않으면 에러가 납니다', () => {
      // given
      const invaliduserId1 = 'invalid_user_id_1';
      const invaliduserId2 = 'invalid_user_id_2';

      // then
      expect(
        userService.blockUser(invaliduserId1, invaliduserId2),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
