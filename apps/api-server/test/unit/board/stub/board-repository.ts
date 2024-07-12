import { Board } from '../../../../src/entity';

export class StubBoardRepository {
  boards: Board[] = [];

  create(board: Partial<Board>): Board {
    return {
      ...board,
      id: 'board-id',
    } as Board;
  }

  save(board: Board): Promise<Board> {
    this.boards.push(board);
    return Promise.resolve(board);
  }

  findOne(conditions: any): Promise<Board> {
    return Promise.resolve(
      this.boards.find((board) => board.id === conditions.where.id),
    );
  }

  async findOneBy(conditions: Partial<Board>): Promise<Board | undefined> {
    return Promise.resolve(
      this.boards.find((board) => board.id === conditions.id),
    );
  }

  async remove(board: Board): Promise<Board> {
    const index = this.boards.findIndex((b) => b.id === board.id);
    if (index !== -1) {
      this.boards.splice(index, 1);
    }
    return board;
  }

  async update(id: string, partialEntity: Partial<Board>): Promise<void> {
    const board = this.boards.find((b) => b.id === id);
    if (board) {
      Object.assign(board, partialEntity);
    }
  }
}
