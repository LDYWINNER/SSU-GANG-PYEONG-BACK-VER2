import { Board } from '../../../../src/entity';

export class StubBoardRepository {
  boards: Board[] = [];

  async create(post: Partial<Board>): Promise<Board> {
    return {
      ...post,
      id: 'board-id',
    } as Board;
  }

  async save(board: Board): Promise<Board> {
    const existingIndex = this.boards.findIndex((b) => b.id === board.id);
    if (existingIndex !== -1) {
      this.boards[existingIndex] = board;
    } else {
      this.boards.push(board);
    }
    return board;
  }

  async findOneBy(conditions: Partial<Board>): Promise<Board | undefined> {
    return this.boards.find((board) => board.id === conditions.id);
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
