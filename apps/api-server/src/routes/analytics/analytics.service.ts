import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PostService } from '../board/post/post.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly boardPostService: PostService,
    private readonly emailService: EmailService,
  ) {}

  // @Cron(CronExpression.EVERY_MINUTE)
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async handleEmailCron() {
    // Logger.log('Email task called');
    const topBoards = await this.boardPostService.findTop5Download();
    // Logger.log(topBoards);
    this.emailService.send('ldywinner@gmail.com', topBoards);
  }
}
