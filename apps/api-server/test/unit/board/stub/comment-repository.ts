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

  async update(
    id: string,
    partialEntity: Partial<BoardComment>,
  ): Promise<void> {
    const comment = this.comments.find((c) => c.id === id);
    if (comment) {
      Object.assign(comment, partialEntity);
    }
  }
}
