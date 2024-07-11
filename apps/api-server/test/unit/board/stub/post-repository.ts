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

  async remove(post: BoardPost): Promise<BoardPost> {
    const index = this.boardPosts.findIndex((p) => p.id === post.id);
    if (index !== -1) {
      this.boardPosts.splice(index, 1);
    }
    return post;
  }

  async update(id: string, newBoardPost: Partial<BoardPost>) {
    const index = this.boardPosts.findIndex((b) => b.id === id);
    if (index >= 0) {
      this.boardPosts[index] = {
        ...this.boardPosts[index],
        ...newBoardPost,
      };
      return this.boardPosts[index];
    }
    return Promise.reject(new Error('Board Post not found'));
  }
}
