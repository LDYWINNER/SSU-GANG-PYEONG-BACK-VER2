import { BoardPost } from '../../../../src/entity';

export class StubBoardPostRepository {
  boardPosts: BoardPost[] = [];

  async create(post: Partial<BoardPost>): Promise<BoardPost> {
    return {
      ...post,
      id: 'post-id',
    } as BoardPost;
  }

  async save(post: BoardPost): Promise<BoardPost> {
    const existingIndex = this.boardPosts.findIndex((p) => p.id === post.id);
    if (existingIndex !== -1) {
      this.boardPosts[existingIndex] = post;
    } else {
      this.boardPosts.push(post);
    }
    return post;
  }

  findOne(conditions: any): Promise<BoardPost> {
    return Promise.resolve(
      this.boardPosts.find((boardPost) => boardPost.id === conditions.where.id),
    );
  }

  async findOneBy(
    conditions: Partial<BoardPost>,
  ): Promise<BoardPost | undefined> {
    return this.boardPosts.find((post) => post.id === conditions.id);
  }

  async find(conditions?: any): Promise<BoardPost[]> {
    const { order = {}, take } = conditions || {};
    let result = [...this.boardPosts];

    if (order.views === 'DESC') {
      result.sort((a, b) => b.views - a.views);
    }

    if (take) {
      result = result.slice(0, take);
    }

    return result;
  }

  async findAndCount(conditions?: any) {
    const { order = {}, take } = conditions || {};
    let result = [...this.boardPosts];

    if (order.views === 'DESC') {
      result.sort((a, b) => b.views - a.views);
    }

    if (take) {
      result = result.slice(0, take);
    }

    return {
      posts: result,
      total: result.length,
    };
  }

  async remove(post: BoardPost): Promise<BoardPost> {
    const index = this.boardPosts.findIndex((p) => p.id === post.id);
    if (index !== -1) {
      this.boardPosts.splice(index, 1);
    }
    return post;
  }

  async update(id: string, partialEntity: any) {
    const index = this.boardPosts.findIndex((bp) => bp.id === id);
    if (typeof partialEntity.likes === 'function') {
      if (partialEntity.likes() === 'likes + 1') {
        this.boardPosts[index] = {
          ...this.boardPosts[index],
          likes: this.boardPosts[index].likes + 1,
        };
        return this.boardPosts[index];
      } else if (partialEntity.likes() === 'likes - 1') {
        this.boardPosts[index] = {
          ...this.boardPosts[index],
          likes: this.boardPosts[index].likes - 1,
        };
        return this.boardPosts[index];
      }
    } else {
      this.boardPosts[index] = {
        ...this.boardPosts[index],
        ...partialEntity,
      };
      return this.boardPosts[index];
    }
  }
}
