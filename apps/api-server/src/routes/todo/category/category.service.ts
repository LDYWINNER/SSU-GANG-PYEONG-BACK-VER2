import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ToDoCategory, User } from '../../../entity';
import { Repository } from 'typeorm';
import { CreateToDoCategoryDto } from './dto/create-todo-category.dto';
import { UpdateToDoCategoryDto } from './dto/update-todo-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(ToDoCategory)
    private toDoCategoryRepository: Repository<ToDoCategory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  getAllCategories = async (userId: string) => {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toDoCategoryRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      relations: ['user'],
    });
  };

  getCategoryById = async (id: string) => {
    const category = await this.toDoCategoryRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.toDoCategoryRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  };

  createCategory = async (
    userId: string,
    createToDoCategoryDto: CreateToDoCategoryDto,
  ) => {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const newCategory = this.toDoCategoryRepository.create({
      ...createToDoCategoryDto,
      user,
    });
    const savedCategory = await this.toDoCategoryRepository.save(newCategory);
    return { ...savedCategory };
  };

  deleteCategory = async (id: string) => {
    const category = await this.toDoCategoryRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.toDoCategoryRepository.remove(category);

    return category;
  };

  updateCategory = async (
    id: string,
    newToDoCategory: UpdateToDoCategoryDto,
  ) => {
    const category = await this.toDoCategoryRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.toDoCategoryRepository.update(id, {
      ...newToDoCategory,
    });

    return this.toDoCategoryRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  };
}
