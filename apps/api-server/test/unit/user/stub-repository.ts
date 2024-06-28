import { Role } from '../../../src/common/enum/user.enum';
import { User } from '../../../src/entity/user.entity';

export class StubUserRepository {
  users: User[] = [
    {
      id: 'test_user_id',
      username: 'test_name',
      email: 'test_email',
      password: 'test_password',
      role: Role.User,
      postCount: 0,
      createdAt: new Date('2024-06-28T18:19:29.764Z'),
      updateAt: new Date('2024-06-28T18:19:29.764Z'),
    },
  ];

  findOne(conditions: any): Promise<User> {
    return Promise.resolve(
      this.users.find((user) => user.id === conditions.where.id),
    );
  }
}
