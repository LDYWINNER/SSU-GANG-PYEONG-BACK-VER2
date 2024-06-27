import { Test, TestingModule } from '@nestjs/testing';
import { SchoolScheduleController } from '../../../src/routes/table/school-schedule/school-schedule.controller';

describe('SchoolScheduleController', () => {
  let controller: SchoolScheduleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchoolScheduleController],
    }).compile();

    controller = module.get<SchoolScheduleController>(SchoolScheduleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
