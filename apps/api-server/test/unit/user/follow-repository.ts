import { Follow } from '../../../src/entity';

export class StubFollowRepository {
  follows = [];

  create(follow: Partial<Follow>): Follow {
    return {
      ...follow,
      id: 'follow-id',
    } as Follow;
  }

  save(follow: Follow): Promise<Follow> {
    this.follows.push(follow);
    return Promise.resolve(follow);
  }

  findOne(conditions: any): Promise<Follow> {
    return Promise.resolve(
      this.follows.find((follow) => follow.id === conditions.where.id),
    );
  }

  findOneBy(conditions: any): Promise<Follow> {
    return Promise.resolve(
      this.follows.find((follow) => follow.id === conditions.id),
    );
  }

  find(conditions: any): Promise<Follow[]> {
    return Promise.resolve(
      this.follows.filter(
        (follow) => follow.user.id === conditions.where.user.id,
      ),
    );
  }

  async remove(follow: Follow): Promise<Follow> {
    const index = this.follows.findIndex((f) => f.id === follow.id);
    if (index >= 0) {
      this.follows.splice(index, 1);
      return follow;
    }
    return Promise.reject(new Error('Follow not found'));
  }
}
