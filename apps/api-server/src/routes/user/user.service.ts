import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserType } from '../../common/enum/user.enum';
import { BoardPost } from '../../entity/board-post.entity';
import { User, Block, Follow } from '../../entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,
    @InjectRepository(Block)
    private blockRepository: Repository<Block>,
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

  async getUser(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: [
        'tables',
        'toDoCategories',
        'toDoTasks',
        'boardPosts',
        'courseReviews',
      ],
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const follows = await this.followRepository.find({
      where: { fk_leader_id: id },
    });

    return {
      ...user,
      followerCount: follows.length,
      followers: follows.map((follow) => follow.fk_follower_id),
    };
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

  async blockUser(haterId: string, hatedId: string) {
    const hater = await this.userRepository.findOneBy({ id: haterId });
    if (!hater) {
      throw new NotFoundException(`User with id ${haterId} not found`);
    }
    const hated = await this.userRepository.findOneBy({ id: hatedId });
    if (!hated) {
      throw new NotFoundException(`User with id ${hatedId} not found`);
    }

    const block = this.blockRepository.create({
      fk_hater_id: haterId,
      fk_hated_id: hatedId,
    });

    return await this.blockRepository.save(block);
  }
}
