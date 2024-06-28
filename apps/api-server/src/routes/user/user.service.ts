import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entity/user.entity';
import { Repository } from 'typeorm';
import { Role } from '../../common/enum/user.enum';
import { BoardPost } from '../../entity/board-post.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOneById(userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    return user;
  }

  async checkUserIsAdmin(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    return user.role === Role.Admin;
  }

  async getUsers(page: number, size: number) {
    const qb = this.userRepository.createQueryBuilder();

    qb.addSelect((subQuery) => {
      return subQuery
        .select('count(id)')
        .from(BoardPost, 'BoardPost')
        .where('BoardPost.userId = User.id');
    }, 'User_postCount');

    qb.skip((page - 1) * size).take(size);

    return qb.getMany();
  }
}
