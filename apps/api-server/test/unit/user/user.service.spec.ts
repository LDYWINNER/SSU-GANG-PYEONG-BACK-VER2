import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../../src/entity/user.entity';
import { UserService } from '../../../src/routes/user/user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { StubUserRepository } from './stub-repository';

describe('User', () => {
  let userService: UserService;
  let userRepository: StubUserRepository;

  beforeEach(async () => {
    userRepository = new StubUserRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
      ],
    }).compile();
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('should', async () => {
    const id = 'test_user_id';
    const result = await userService.findOneById(id);
    expect(result.id).toBe(id);
  });
});
