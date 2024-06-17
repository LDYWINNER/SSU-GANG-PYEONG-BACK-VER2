import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BoardService } from '../board/board.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly boardService: BoardService) {}

  // @Cron(CronExpression.EVERY_DAY_AT_10AM)
  @Cron(CronExpression.EVERY_MINUTE)
  async handleEmailCron() {
    Logger.log('Email task called');
    const topBoards = await this.boardService.findTop5Download();
    Logger.log(topBoards);
  }
}
