import { Role } from 'apps/api-server/src/common/enum/user.enum';
import { User } from '../../../src/entity/user.entity';

export class StubUserRepository {
  users: User[] = [
    {
      id: 'test_id',
      username: 'test_name',
      email: 'test_email',
      password: 'test_password',
      role: Role.User,
      postCount: 0,
      createdAt: new Date(),
      updateAt: new Date(),
    },
  ];

  findOneBy(id: string): Promise<User> {
    return Promise.resolve(this.users.find((user) => user.id === id));
  }
}
