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
}
