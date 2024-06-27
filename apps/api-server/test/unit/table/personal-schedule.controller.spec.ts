import { Test, TestingModule } from '@nestjs/testing';
import { PersonalScheduleController } from '../../../src/routes/table/personal-schedule/personal-schedule.controller';

describe('PersonalScheduleController', () => {
  let controller: PersonalScheduleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonalScheduleController],
    }).compile();

    controller = module.get<PersonalScheduleController>(
      PersonalScheduleController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
