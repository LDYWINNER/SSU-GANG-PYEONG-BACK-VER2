import { ToDoCategory } from '../../../../src/entity/todo-category.entity';

export class StubCategoryRepository {
  toDoCategories = [];

  create(toDoCategory: Partial<ToDoCategory>): ToDoCategory {
    return {
      ...toDoCategory,
      id: 'todo-category-id',
    } as ToDoCategory;
  }

  save(toDoCategory: ToDoCategory): Promise<ToDoCategory> {
    this.toDoCategories.push(toDoCategory);
    return Promise.resolve(toDoCategory);
  }

  findOne(conditions: any): Promise<ToDoCategory> {
    return Promise.resolve(
      this.toDoCategories.find(
        (toDoCategory) => toDoCategory.id === conditions.where.id,
      ),
    );
  }

  findOneBy(conditions: any): Promise<ToDoCategory> {
    return Promise.resolve(
      this.toDoCategories.find(
        (toDoCategory) => toDoCategory.id === conditions.id,
      ),
    );
  }

  find(conditions: any): Promise<ToDoCategory[]> {
    return Promise.resolve(
      this.toDoCategories.filter(
        (toDoCategory) => toDoCategory.user.id === conditions.where.user.id,
      ),
    );
  }

  async update(
    id: string,
    newToDoCategory: Partial<ToDoCategory>,
  ): Promise<any> {
    const index = this.toDoCategories.findIndex(
      (newToDoCategory) => newToDoCategory.id === id,
    );
    if (index >= 0) {
      this.toDoCategories[index] = {
        ...this.toDoCategories[index],
        ...newToDoCategory,
      };
      return this.toDoCategories[index];
    }
    return Promise.reject(new Error('ToDo Category not found'));
  }

  async remove(toDoCategory: ToDoCategory): Promise<ToDoCategory> {
    const index = this.toDoCategories.findIndex(
      (tdc) => tdc.id === toDoCategory.id,
    );
    if (index >= 0) {
      this.toDoCategories.splice(index, 1);
      return toDoCategory;
    }
    return Promise.reject(new Error('ToDo Category not found'));
  }
}
