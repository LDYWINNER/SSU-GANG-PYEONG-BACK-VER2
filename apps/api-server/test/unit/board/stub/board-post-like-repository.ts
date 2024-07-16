import { BoardPostLike } from '../../../../src/entity';

export class StubBoardPostLikeRepository {
  boardPostLikes = [];

  create(boardPostLike: Partial<BoardPostLike>): BoardPostLike {
    return {
      ...boardPostLike,
      id: 'board-post-like-id',
    } as BoardPostLike;
  }

  save(boardPostLike: BoardPostLike): Promise<BoardPostLike> {
    this.boardPostLikes.push(boardPostLike);
    return Promise.resolve(boardPostLike);
  }

  async delete({
    fk_user_id: userId,
    fk_board_post_id: boardPostId,
  }): Promise<BoardPostLike> {
    const index = this.boardPostLikes.findIndex(
      (bpl) =>
        bpl.fk_user_id === userId && bpl.fk_board_post_id === boardPostId,
    );
    if (index >= 0) {
      const res = this.boardPostLikes[index];
      this.boardPostLikes.splice(index, 1);
      return res;
    }
    return Promise.reject(new Error('Board Post Like not found'));
  }

  async count(condition: any): Promise<number> {
    return this.boardPostLikes.filter(
      (bpl) => bpl.fk_board_post_id === condition.where.fk_board_post_id,
    ).length;
  }
}
