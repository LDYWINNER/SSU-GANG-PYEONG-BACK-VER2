import { Test, TestingModule } from '@nestjs/testing';
import { SchoolScheduleService } from './school-schedule.service';

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
