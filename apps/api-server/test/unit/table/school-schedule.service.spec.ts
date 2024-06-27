import { Test, TestingModule } from '@nestjs/testing';
import { SchoolScheduleService } from '../../../src/routes/table/school-schedule/school-schedule.service';

describe('SchoolScheduleService', () => {
  let service: SchoolScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchoolScheduleService],
    }).compile();

    service = module.get<SchoolScheduleService>(SchoolScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
