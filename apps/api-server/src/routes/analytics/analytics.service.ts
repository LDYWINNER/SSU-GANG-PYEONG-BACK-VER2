import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PostService } from '../board/post/post.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly boardPostService: PostService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  // @Cron(CronExpression.EVERY_MINUTE)
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async handleEmailCron() {
    const topBoards = await this.boardPostService.findTop5Download();

    this.emailService.boardAnalysisSend(
      this.configService.get('email.admin'),
      topBoards,
    );
  }
}
