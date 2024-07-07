import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  InternalServerErrorException,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiTags } from '@nestjs/swagger';
import { ThrottlerBehindProxyGuard } from '../../../common/guard/throttler-behind-proxy.guard';
import {
  UserAfterAuth,
  UserInfo,
} from '../../../common/decorators/user-info.decorator';
import { CreateToDoCategoryDto } from './dto/create-todo-category.dto';
import { UpdateToDoCategoryDto } from './dto/update-todo-category.dto';

@Controller('todo/category')
@ApiTags('ToDo Category')
@UseGuards(ThrottlerBehindProxyGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getAllCategories(@UserInfo() userInfo: UserAfterAuth) {
    try {
      const userId = userInfo.id;
      const categories = await this.categoryService.getAllCategories(userId);
      if (!categories) {
        return [];
      }

      return categories;
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  async getCategoryById(@Param('id') id: string) {
    try {
      const category = await this.categoryService.getCategoryById(id);
      if (!category) {
        throw new InternalServerErrorException(
          `Failed to get category by id: ${id}`,
        );
      }

      return category;
    } catch (error) {
      throw error;
    }
  }

  @Post()
  async createCategory(
    @UserInfo() userInfo: UserAfterAuth,
    @Body() createToDoCategoryDto: CreateToDoCategoryDto,
  ) {
    try {
      const userId = userInfo.id;
      const result = await this.categoryService.createCategory(
        userId,
        createToDoCategoryDto,
      );
      if (!result) {
        throw new InternalServerErrorException('Failed to create category');
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    try {
      const result = await this.categoryService.deleteCategory(id);
      if (!result) {
        throw new InternalServerErrorException(
          `Failed to delete category by id: ${id}`,
        );
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  async updateCategory(
    @Param('id') id: string,
    @Body() updateToDoCategoryDto: UpdateToDoCategoryDto,
  ) {
    try {
      const result = await this.categoryService.updateCategory(
        id,
        updateToDoCategoryDto,
      );
      if (!result) {
        throw new InternalServerErrorException(
          `Failed to update category by id: ${id}`,
        );
      }

      return result;
    } catch (error) {
      throw error;
    }
  }
}
