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
