import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Board, User } from '../../entity';
import { Repository } from 'typeorm';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  getAllBoards = async (userId: string) => {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    return this.boardRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      relations: ['posts', 'user'],
    });
  };

  getBoardById = async (id: string) => {
    const cacheKey = `board-${id}`;
    const cachedBoard = await this.cacheManager.get(cacheKey);

    if (cachedBoard) {
      return cachedBoard;
    }

    try {
      const board = await this.boardRepository.findOne({
        where: { id },
        relations: ['posts', 'user'],
      });
      if (!board) {
        throw new NotFoundException(`Board with id ${id} not found`);
      }

      await this.cacheManager.set(cacheKey, board, 60 * 60 * 5);

      return board;
    } catch (error) {
      console.log(error);
    }
  };

  createBoard = async (userId: string, createBoardDto: CreateBoardDto) => {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const newBoard = this.boardRepository.create({
      ...createBoardDto,
      user,
    });
    const savedBoard = await this.boardRepository.save(newBoard);
    return { ...savedBoard };
  };

  deleteBoard = async (id: string) => {
    const board = await this.boardRepository.findOne({
      where: { id },
    });
    if (!board) {
      throw new NotFoundException(`Board with id ${id} not found`);
    }

    await this.boardRepository.remove(board);

    return board;
  };

  updateBoard = async (id: string, newBoard: UpdateBoardDto) => {
    const board = await this.boardRepository.findOne({
      where: { id },
    });
    if (!board) {
      throw new NotFoundException(`Board with id ${id} not found`);
    }

    await this.boardRepository.update(id, {
      ...newBoard,
    });

    return this.boardRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  };
}
