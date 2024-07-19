import { BoardCommentLike } from '../../../../src/entity';

export class StubBoardCommentLikeRepository {
  boardCommentLikes = [];

  create(boardCommentLike: Partial<BoardCommentLike>): BoardCommentLike {
    return {
      ...boardCommentLike,
      id: 'board-comment-like-id',
    } as BoardCommentLike;
  }

  save(boardCommentLike: BoardCommentLike): Promise<BoardCommentLike> {
    this.boardCommentLikes.push(boardCommentLike);
    return Promise.resolve(boardCommentLike);
  }

  findOne(conditions: any): Promise<BoardCommentLike> {
    return this.boardCommentLikes.find(
      (bcl) =>
        bcl.fk_user_id === conditions.where.fk_user_id &&
        bcl.fk_board_comment_id === conditions.where.fk_board_comment_id,
    );
  }

  find(conditions: any): Promise<BoardCommentLike[]> {
    return Promise.resolve(
      this.boardCommentLikes.filter(
        (bcl) =>
          bcl.fk_board_comment_id.id ===
          conditions.where.fk_board_comment_id.id,
      ),
    );
  }

  remove(boardCommentLike: BoardCommentLike): Promise<BoardCommentLike> {
    const index = this.boardCommentLikes.findIndex(
      (bpl) =>
        bpl.fk_user_id === boardCommentLike.fk_user_id &&
        bpl.fk_board_comment_id === boardCommentLike.fk_board_comment_id,
    );
    if (index >= 0) {
      const result = this.boardCommentLikes[index];
      this.boardCommentLikes.splice(index, 1);
      return result;
    }
    return Promise.reject(new Error('Board Comment Like not found'));
  }

  async delete({
    fk_user_id: userId,
    fk_board_comment_id: boardCommentId,
  }): Promise<BoardCommentLike> {
    const index = this.boardCommentLikes.findIndex(
      (bcl) =>
        bcl.fk_user_id === userId && bcl.fk_board_comment_id === boardCommentId,
    );
    if (index >= 0) {
      const res = this.boardCommentLikes[index];
      this.boardCommentLikes.splice(index, 1);
      return res;
    }
    return Promise.reject(new Error('Course Review Like not found'));
  }

  async count(condition: any): Promise<number> {
    return this.boardCommentLikes.filter(
      (bcl) => bcl.fk_board_comment_id === condition.where.fk_board_comment_id,
    ).length;
  }
}
