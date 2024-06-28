import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../../src/entity/user.entity';
import { UserService } from '../../../src/routes/user/user.service';
import { Test, TestingModule } from '@nestjs/testing';

class MockRepository {
  async findOneBy(query) {
    const user: User = new User();
    user.id = query.id;
    return user;
  }
}

describe('User', () => {
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: MockRepository,
        },
      ],
    }).compile();
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('should', async () => {
    const id = 'test_id';
    const result = await userService.findOneById(id);
    expect(result.id).toBe(id);
  });
});
