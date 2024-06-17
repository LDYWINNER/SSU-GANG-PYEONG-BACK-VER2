import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BoardService } from '../board/board.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly boardService: BoardService,
    private readonly emailService: EmailService,
  ) {}

  // @Cron(CronExpression.EVERY_MINUTE)
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async handleEmailCron() {
    // Logger.log('Email task called');
    const topBoards = await this.boardService.findTop5Download();
    // Logger.log(topBoards);
    this.emailService.send('ldywinner@gmail.com', topBoards);
  }
}
