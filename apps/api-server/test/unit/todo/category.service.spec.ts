import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './../../../src/routes/todo/category/category.service';
import { ToDoCategory, User } from '../../../src/entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StubCategoryRepository } from './stub/category-repository';
import { NotFoundException } from '@nestjs/common';
import { StubUserRepository } from '../user/stub-repository';
import { UserType } from '../../../src/common/enum/user.enum';

describe('투두 카테고리 관련 서비스 테스트', () => {
  let categoryService: CategoryService;
  let categoryRepository: StubCategoryRepository;
  let userRepository: StubUserRepository;
  const categoryRepositoryToken = getRepositoryToken(ToDoCategory);
  const userRepositoryToken = getRepositoryToken(User);
  const userId = 'test_user_id';

  beforeEach(async () => {
    categoryRepository = new StubCategoryRepository();
    userRepository = new StubUserRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: categoryRepositoryToken,
          useValue: categoryRepository,
        },
        {
          provide: userRepositoryToken,
          useValue: userRepository,
        },
      ],
    }).compile();

    categoryService = module.get<CategoryService>(CategoryService);
  });

  describe('createCategory 함수 테스트', () => {
    it('createCategory 함수 결과값 테스트', async () => {
      // given
      const categoryDto = {
        color: {
          id: 'color_id',
          code: '#FFFFFF',
          name: 'white',
        },
        icon: {
          id: 'icon_id',
          name: 'icon_name',
          symbol: '🌱',
        },
        isEditable: true,
        name: 'category_name',
      };
      const categoryCount = categoryRepository.toDoCategories.length;

      // when
      const result = await categoryService.createCategory(userId, categoryDto);

      // then
      expect(result).toEqual({
        id: 'todo-category-id',
        color: {
          id: 'color_id',
          code: '#FFFFFF',
          name: 'white',
        },
        icon: {
          id: 'icon_id',
          name: 'icon_name',
          symbol: '🌱',
        },
        isEditable: true,
        name: 'category_name',
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          courseReviewCount: 0,
          role: UserType.User.text,
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
      expect(categoryRepository.toDoCategories.length).toBe(categoryCount + 1);
      expect(categoryRepository.toDoCategories).toContainEqual({
        id: 'todo-category-id',
        color: {
          id: 'color_id',
          code: '#FFFFFF',
          name: 'white',
        },
        icon: {
          id: 'icon_id',
          name: 'icon_name',
          symbol: '🌱',
        },
        isEditable: true,
        name: 'category_name',
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          courseReviewCount: 0,
          role: UserType.User.text,
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
    });

    it('userId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const userId = 'invalid-user-id';
      const categoryDto = {
        color: {
          id: 'color_id',
          code: '#FFFFFF',
          name: 'white',
        },
        icon: {
          id: 'icon_id',
          name: 'icon_name',
          symbol: '🌱',
        },
        isEditable: true,
        name: 'category_name',
      };

      // then
      expect(
        categoryService.createCategory(userId, categoryDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllCategories & getCategoryById 함수 테스트', () => {
    it('getAllCategories 함수 결과값 테스트', async () => {
      // given
      categoryRepository.toDoCategories.push({
        id: 'get_all_category_test_id_1',
        color: {
          id: 'color_id',
          code: '#FFFFFF',
          name: 'white',
        },
        icon: {
          id: 'icon_id',
          name: 'icon_name',
          symbol: '🌱',
        },
        isEditable: true,
        name: 'category_name_1',
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          courseReviewCount: 0,
          role: UserType.User.text,
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
      categoryRepository.toDoCategories.push({
        id: 'get_all_category_test_id_2',
        color: {
          id: 'color_id',
          code: '#000000',
          name: 'black',
        },
        icon: {
          id: 'icon_id',
          name: 'icon_name',
          symbol: '🌱',
        },
        isEditable: true,
        name: 'category_name_2',
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          courseReviewCount: 0,
          role: UserType.User.text,
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });

      // when
      const result = await categoryService.getAllCategories(userId);

      // then
      expect(result).toEqual([
        {
          id: 'get_all_category_test_id_1',
          color: {
            id: 'color_id',
            code: '#FFFFFF',
            name: 'white',
          },
          icon: {
            id: 'icon_id',
            name: 'icon_name',
            symbol: '🌱',
          },
          isEditable: true,
          name: 'category_name_1',
          user: {
            createdAt: new Date('2024-06-28T18:19:29.764Z'),
            email: 'test_email',
            id: 'test_user_id',
            password: 'test_password',
            courseReviewCount: 0,
            role: UserType.User.text,
            updateAt: new Date('2024-06-28T18:19:29.764Z'),
            username: 'test_name',
          },
        },
        {
          id: 'get_all_category_test_id_2',
          color: {
            id: 'color_id',
            code: '#000000',
            name: 'black',
          },
          icon: {
            id: 'icon_id',
            name: 'icon_name',
            symbol: '🌱',
          },
          isEditable: true,
          name: 'category_name_2',
          user: {
            createdAt: new Date('2024-06-28T18:19:29.764Z'),
            email: 'test_email',
            id: 'test_user_id',
            password: 'test_password',
            courseReviewCount: 0,
            role: UserType.User.text,
            updateAt: new Date('2024-06-28T18:19:29.764Z'),
            username: 'test_name',
          },
        },
      ]);
    });

    it('getAllCategories: userId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const invalidUserId = 'invalid-user-id';

      expect(categoryService.getAllCategories(invalidUserId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('getCategoryById 함수 결과값 테스트', async () => {
      // given
      const categoryId1 = 'get_id_category_test_id_1';
      const categoryId2 = 'get_id_category_test_id_2';
      categoryRepository.toDoCategories.push({
        id: 'get_id_category_test_id_1',
        color: {
          id: 'color_id',
          code: '#000000',
          name: 'black',
        },
        icon: {
          id: 'icon_id',
          name: 'icon_name',
          symbol: '🌱',
        },
        isEditable: true,
        name: 'category_name_1',
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          courseReviewCount: 0,
          role: UserType.User.text,
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
      categoryRepository.toDoCategories.push({
        id: 'get_id_category_test_id_2',
        color: {
          id: 'color_id',
          code: '#FFFFFF',
          name: 'white',
        },
        icon: {
          id: 'icon_id',
          name: 'icon_name',
          symbol: '🌱',
        },
        isEditable: true,
        name: 'category_name_2',
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          courseReviewCount: 0,
          role: UserType.User.text,
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });

      // when
      const result1 = await categoryService.getCategoryById(categoryId1);
      const result2 = await categoryService.getCategoryById(categoryId2);

      // then
      expect(result1).toEqual({
        id: 'get_id_category_test_id_1',
        color: {
          id: 'color_id',
          code: '#000000',
          name: 'black',
        },
        icon: {
          id: 'icon_id',
          name: 'icon_name',
          symbol: '🌱',
        },
        isEditable: true,
        name: 'category_name_1',
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          courseReviewCount: 0,
          role: UserType.User.text,
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
      expect(result2).toEqual({
        id: 'get_id_category_test_id_2',
        color: {
          id: 'color_id',
          code: '#FFFFFF',
          name: 'white',
        },
        icon: {
          id: 'icon_id',
          name: 'icon_name',
          symbol: '🌱',
        },
        isEditable: true,
        name: 'category_name_2',
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          courseReviewCount: 0,
          role: UserType.User.text,
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
    });

    it('getCategoryById: categoryId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const categoryId = 'invalid-category-id';

      // then
      expect(categoryService.getCategoryById(categoryId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateCategory 함수 테스트', () => {
    it('투두 카테고리 이름(name) 변경 시 updateCategory 함수 결과값 테스트', async () => {
      // given
      const categoryId = 'update_category_test_id';
      categoryRepository.toDoCategories.push({
        id: 'update_category_test_id',
        color: {
          id: 'color_id',
          code: '#000000',
          name: 'black',
        },
        icon: {
          id: 'icon_id',
          name: 'icon_name',
          symbol: '🌱',
        },
        isEditable: true,
        name: 'category_name',
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          courseReviewCount: 0,
          role: UserType.User.text,
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
      const categoryCount = categoryRepository.toDoCategories.length;

      // when
      const result = await categoryService.updateCategory(categoryId, {
        name: 'new_category_name',
      });

      // then
      expect(result).toEqual({
        id: 'update_category_test_id',
        color: {
          id: 'color_id',
          code: '#000000',
          name: 'black',
        },
        icon: {
          id: 'icon_id',
          name: 'icon_name',
          symbol: '🌱',
        },
        isEditable: true,
        name: 'new_category_name',
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          courseReviewCount: 0,
          role: UserType.User.text,
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
      expect(categoryRepository.toDoCategories.length).toBe(categoryCount);
      expect(categoryRepository.toDoCategories).toContainEqual({
        id: 'update_category_test_id',
        color: {
          id: 'color_id',
          code: '#000000',
          name: 'black',
        },
        icon: {
          id: 'icon_id',
          name: 'icon_name',
          symbol: '🌱',
        },
        isEditable: true,
        name: 'new_category_name',
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          courseReviewCount: 0,
          role: UserType.User.text,
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
    });

    it('투두 카테고리 수정 가능 여부(isEditable) 변경 시 updateCategory 함수 결과값 테스트', async () => {
      // given
      const categoryId = 'update_category_test_id';
      categoryRepository.toDoCategories.push({
        id: 'update_category_test_id',
        color: {
          id: 'color_id',
          code: '#000000',
          name: 'black',
        },
        icon: {
          id: 'icon_id',
          name: 'icon_name',
          symbol: '🌱',
        },
        isEditable: true,
        name: 'category_name',
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          courseReviewCount: 0,
          role: UserType.User.text,
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
      const categoryCount = categoryRepository.toDoCategories.length;

      // when
      const result = await categoryService.updateCategory(categoryId, {
        isEditable: false,
      });

      // then
      expect(result).toEqual({
        id: 'update_category_test_id',
        color: {
          id: 'color_id',
          code: '#000000',
          name: 'black',
        },
        icon: {
          id: 'icon_id',
          name: 'icon_name',
          symbol: '🌱',
        },
        isEditable: false,
        name: 'category_name',
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          courseReviewCount: 0,
          role: UserType.User.text,
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
      expect(categoryRepository.toDoCategories.length).toBe(categoryCount);
      expect(categoryRepository.toDoCategories).toContainEqual({
        id: 'update_category_test_id',
        color: {
          id: 'color_id',
          code: '#000000',
          name: 'black',
        },
        icon: {
          id: 'icon_id',
          name: 'icon_name',
          symbol: '🌱',
        },
        isEditable: false,
        name: 'category_name',
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          courseReviewCount: 0,
          role: UserType.User.text,
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
    });

    it('투두 카테고리 color 객체 변경 시 updateCategory 함수 결과값 테스트', async () => {
      // given
      const categoryId = 'update_category_test_id';
      categoryRepository.toDoCategories.push({
        id: 'update_category_test_id',
        color: {
          id: 'color_id',
          code: '#000000',
          name: 'black',
        },
        icon: {
          id: 'icon_id',
          name: 'icon_name',
          symbol: '🌱',
        },
        isEditable: true,
        name: 'category_name',
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          courseReviewCount: 0,
          role: UserType.User.text,
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
      const categoryCount = categoryRepository.toDoCategories.length;

      // when
      const result = await categoryService.updateCategory(categoryId, {
        color: {
          id: 'color_id',
          code: '#FFFFFF',
          name: 'white',
        },
      });

      // then
      expect(result).toEqual({
        id: 'update_category_test_id',
        color: {
          id: 'color_id',
          code: '#FFFFFF',
          name: 'white',
        },
        icon: {
          id: 'icon_id',
          name: 'icon_name',
          symbol: '🌱',
        },
        isEditable: true,
        name: 'category_name',
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          courseReviewCount: 0,
          role: UserType.User.text,
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
      expect(categoryRepository.toDoCategories.length).toBe(categoryCount);
      expect(categoryRepository.toDoCategories).toContainEqual({
        id: 'update_category_test_id',
        color: {
          id: 'color_id',
          code: '#FFFFFF',
          name: 'white',
        },
        icon: {
          id: 'icon_id',
          name: 'icon_name',
          symbol: '🌱',
        },
        isEditable: true,
        name: 'category_name',
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          courseReviewCount: 0,
          role: UserType.User.text,
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
    });

    it('투두 카테고리 icon 객체 변경 시 updateCategory 함수 결과값 테스트', async () => {
      // given
      const categoryId = 'update_category_test_id';
      categoryRepository.toDoCategories.push({
        id: 'update_category_test_id',
        color: {
          id: 'color_id',
          code: '#000000',
          name: 'black',
        },
        icon: {
          id: 'icon_id',
          name: 'icon_name',
          symbol: '🌱',
        },
        isEditable: true,
        name: 'category_name',
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          courseReviewCount: 0,
          role: UserType.User.text,
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
      const categoryCount = categoryRepository.toDoCategories.length;

      // when
      const result = await categoryService.updateCategory(categoryId, {
        icon: {
          id: 'icon_id',
          name: 'updated_icon_name',
          symbol: '📈',
        },
      });

      // then
      expect(result).toEqual({
        id: 'update_category_test_id',
        color: {
          id: 'color_id',
          code: '#000000',
          name: 'black',
        },
        icon: {
          id: 'icon_id',
          name: 'updated_icon_name',
          symbol: '📈',
        },
        isEditable: true,
        name: 'category_name',
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          courseReviewCount: 0,
          role: UserType.User.text,
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
      expect(categoryRepository.toDoCategories.length).toBe(categoryCount);
      expect(categoryRepository.toDoCategories).toContainEqual({
        id: 'update_category_test_id',
        color: {
          id: 'color_id',
          code: '#000000',
          name: 'black',
        },
        icon: {
          id: 'icon_id',
          name: 'updated_icon_name',
          symbol: '📈',
        },
        isEditable: true,
        name: 'category_name',
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          courseReviewCount: 0,
          role: UserType.User.text,
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
    });

    it('categoryId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const categoryId = 'invalid-category-id';

      // then
      expect(
        categoryService.updateCategory(categoryId, {
          isEditable: false,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteCategory 함수 테스트', () => {
    it('deleteCategory 함수 결과값 테스트', async () => {
      // given
      const categoryId = 'delete_category_test_id';
      categoryRepository.toDoCategories.push({
        id: 'delete_category_test_id',
        color: {
          id: 'color_id',
          code: '#000000',
          name: 'black',
        },
        icon: {
          id: 'icon_id',
          name: 'icon_name',
          symbol: '🌱',
        },
        isEditable: true,
        name: 'category_name',
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          courseReviewCount: 0,
          role: UserType.User.text,
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
      const categoryCount = categoryRepository.toDoCategories.length;

      // when
      const result = await categoryService.deleteCategory(categoryId);

      // then
      expect(result).toEqual({
        id: 'delete_category_test_id',
        color: {
          id: 'color_id',
          code: '#000000',
          name: 'black',
        },
        icon: {
          id: 'icon_id',
          name: 'icon_name',
          symbol: '🌱',
        },
        isEditable: true,
        name: 'category_name',
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          courseReviewCount: 0,
          role: UserType.User.text,
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
      expect(categoryRepository.toDoCategories.length).toBe(categoryCount - 1);
      expect(categoryRepository.toDoCategories).not.toContainEqual({
        id: 'delete_category_test_id',
        color: {
          id: 'color_id',
          code: '#000000',
          name: 'black',
        },
        icon: {
          id: 'icon_id',
          name: 'icon_name',
          symbol: '🌱',
        },
        isEditable: true,
        name: 'category_name',
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          courseReviewCount: 0,
          role: UserType.User.text,
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
    });

    it('categoryId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const categoryId = 'invalid-category-id';

      // then
      expect(categoryService.deleteCategory(categoryId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
