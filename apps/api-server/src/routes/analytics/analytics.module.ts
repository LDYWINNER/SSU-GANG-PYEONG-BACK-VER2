import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ScheduleModule } from '@nestjs/schedule';
import { BoardModule } from '../board/board.module';

@Module({
  imports: [ScheduleModule.forRoot(), BoardModule],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
