import { BoardComment } from '../../../../src/entity';

export class StubCommentRepository {
  comments: BoardComment[] = [];

  create(comment: Partial<BoardComment>): BoardComment {
    return {
      ...comment,
      id: 'comment-id',
    } as BoardComment;
  }

  save(comment: BoardComment): Promise<BoardComment> {
    this.comments.push(comment);
    return Promise.resolve(comment);
  }

  findOne(conditions: any): Promise<BoardComment> {
    return Promise.resolve(
      this.comments.find((comment) => comment.id === conditions.where.id),
    );
  }

  async findOneBy(
    conditions: Partial<BoardComment>,
  ): Promise<BoardComment | undefined> {
    return Promise.resolve(
      this.comments.find((comment) => comment.id === conditions.id),
    );
  }

  async remove(comment: BoardComment): Promise<BoardComment> {
    const index = this.comments.findIndex((c) => c.id === comment.id);
    if (index !== -1) {
      this.comments.splice(index, 1);
    }
    return comment;
  }

  async update(id: string, partialEntity: any) {
    const index = this.comments.findIndex((bc) => bc.id === id);
    if (typeof partialEntity.likes === 'function') {
      if (partialEntity.likes() === 'likes + 1') {
        this.comments[index] = {
          ...this.comments[index],
          likes: this.comments[index].likes + 1,
        };
        return this.comments[index];
      } else if (partialEntity.likes() === 'likes - 1') {
        this.comments[index] = {
          ...this.comments[index],
          likes: this.comments[index].likes - 1,
        };
        return this.comments[index];
      }
    } else {
      this.comments[index] = {
        ...this.comments[index],
        ...partialEntity,
      };
      return this.comments[index];
    }
  }
}
