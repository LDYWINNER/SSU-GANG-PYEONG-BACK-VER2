import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entity/user.entity';
import { Repository } from 'typeorm';
import { UserType } from '../../common/enum/user.enum';
import { BoardPost } from '../../entity/board-post.entity';
import { Follow } from '../../entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,
  ) {}

  async findOneById(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    return user;
  }

  async checkUserIsAdmin(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    return user.role === UserType.Admin.text;
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

  async createFollow(leaderId: string, followerId: string) {
    const leader = await this.userRepository.findOneBy({ id: leaderId });
    if (!leader) {
      throw new NotFoundException(`User with id ${leaderId} not found`);
    }
    const follower = await this.userRepository.findOneBy({ id: followerId });
    if (!follower) {
      throw new NotFoundException(`User with id ${followerId} not found`);
    }

    const follow = this.followRepository.create({
      fk_leader_id: leaderId,
      fk_follower_id: followerId,
    });

    return await this.followRepository.save(follow);
  }

  async removeFollow(leaderId: string, followerId: string) {
    const leader = await this.userRepository.findOneBy({ id: leaderId });
    if (!leader) {
      throw new NotFoundException(`User with id ${leaderId} not found`);
    }
    const follower = await this.userRepository.findOneBy({ id: followerId });
    if (!follower) {
      throw new NotFoundException(`User with id ${followerId} not found`);
    }

    const follow = await this.followRepository.findOneBy({
      fk_leader_id: leaderId,
      fk_follower_id: followerId,
    });
    if (!follow) {
      throw new Error('Follow not found');
    }

    await this.followRepository.remove(follow);

    return follow;
  }

  async getFollower(leaderId: string) {
    const leader = await this.userRepository.findOneBy({ id: leaderId });
    if (!leader) {
      throw new NotFoundException(`User with id ${leaderId} not found`);
    }

    const follows = await this.followRepository.find({
      where: { fk_leader_id: leaderId },
    });

    return {
      count: follows.length,
      followers: follows.map((follow) => follow.fk_follower_id),
    };
  }
}
