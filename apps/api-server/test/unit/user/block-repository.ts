import { Block } from '../../../src/entity';

export class StubBlockRepository {
  blocks = [];

  create(block: Partial<Block>): Block {
    return {
      ...block,
      id: 'block-id',
    } as Block;
  }

  save(block: Block): Promise<Block> {
    this.blocks.push(block);
    return Promise.resolve(block);
  }
}
