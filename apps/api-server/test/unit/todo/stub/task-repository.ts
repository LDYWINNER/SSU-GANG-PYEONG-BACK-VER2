import { ToDoTask } from '../../../../src/entity/todo-task.entity';

export class StubTaskRepository {
  toDoTasks = [];

  create(toDoTask: Partial<ToDoTask>): ToDoTask {
    return {
      ...toDoTask,
      id: 'todo-task-id',
    } as ToDoTask;
  }

  save(toDoTask: ToDoTask): Promise<ToDoTask> {
    this.toDoTasks.push(toDoTask);
    return Promise.resolve(toDoTask);
  }

  findOne(conditions: any): Promise<ToDoTask> {
    return Promise.resolve(
      this.toDoTasks.find((toDoTask) => toDoTask.id === conditions.where.id),
    );
  }

  findOneBy(conditions: any): Promise<ToDoTask> {
    return Promise.resolve(
      this.toDoTasks.find((toDoTask) => toDoTask.id === conditions.id),
    );
  }

  find(conditions: any): Promise<ToDoTask[]> {
    if (conditions.where.toDoCategory !== undefined) {
      return Promise.resolve(
        this.toDoTasks.filter(
          (toDoTask) =>
            toDoTask.toDoCategory.id === conditions.where.toDoCategory.id,
        ),
      );
    } else if (
      conditions.where.user !== undefined &&
      conditions.where.isCompleted !== undefined
    ) {
      return Promise.resolve(
        this.toDoTasks.filter(
          (toDoTask) =>
            toDoTask.user.id === conditions.where.user.id &&
            toDoTask.isCompleted === conditions.where.isCompleted,
        ),
      );
    } else if (
      conditions.where.user !== undefined &&
      conditions.where.completeDate !== undefined
    ) {
      // Simulate Like functionality for completeDate
      const yearMonthPattern = conditions.where.completeDate._value;

      return Promise.resolve(
        this.toDoTasks.filter(
          (toDoTask) =>
            toDoTask.user.id === conditions.where.user.id &&
            toDoTask.completeDate.startsWith(yearMonthPattern),
        ),
      );
    } else if (conditions.where.user !== undefined) {
      return Promise.resolve(
        this.toDoTasks.filter(
          (toDoTask) => toDoTask.user.id === conditions.where.user.id,
        ),
      );
    }
  }

  async update(id: string, newToDoTask: Partial<ToDoTask>): Promise<any> {
    const index = this.toDoTasks.findIndex(
      (newToDoTask) => newToDoTask.id === id,
    );
    if (index >= 0) {
      this.toDoTasks[index] = {
        ...this.toDoTasks[index],
        ...newToDoTask,
      };
      return this.toDoTasks[index];
    }
    return Promise.reject(new Error('ToDo Task not found'));
  }

  async remove(toDoTask: ToDoTask): Promise<ToDoTask> {
    const index = this.toDoTasks.findIndex((tdt) => tdt.id === toDoTask.id);
    if (index >= 0) {
      this.toDoTasks.splice(index, 1);
      return toDoTask;
    }
    return Promise.reject(new Error('ToDo Task not found'));
  }

  // query builder stub
  parameterObject: { todayString?: string; date?: string; yearMonth?: string };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createQueryBuilder(alias: string): StubTaskRepository {
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  leftJoinAndSelect(relation: string, alias: string): StubTaskRepository {
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  where(condition: string, parameters: object): StubTaskRepository {
    return this;
  }

  andWhere(condition: string, parameters: object): StubTaskRepository {
    this.parameterObject = parameters;
    return this;
  }

  getMany(): Promise<ToDoTask[]> {
    const userId = this.toDoTasks[0]?.user?.id;
    let dateFilterString: string;
    if (this.parameterObject.todayString !== undefined) {
      dateFilterString = this.parameterObject.todayString;
    } else if (this.parameterObject.date !== undefined) {
      dateFilterString = this.parameterObject.date;
    } else if (this.parameterObject.yearMonth !== undefined) {
      dateFilterString = this.parameterObject.yearMonth;
    }

    const filteredTasks = this.toDoTasks.filter(
      (task) =>
        task.user.id === userId &&
        task.completeDate.startsWith(dateFilterString.split('%')[0]),
    );

    return Promise.resolve(filteredTasks);
  }
}
