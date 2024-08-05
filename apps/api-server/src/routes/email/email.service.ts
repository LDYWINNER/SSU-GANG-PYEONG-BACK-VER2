import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { BoardPost } from '../../entity/board-post.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async registerEmailSend(email: string, registerCode: string) {
    await this.mailerService.sendMail({
      from: email,
      to: this.configService.get('email.user'),
      subject: 'SSUGANGPYEONG Register Verification',
      template: 'registerMail',
      context: {
        registerCode,
      },
    });
  }

  async loginEmailSend(email: string, loginCode: string) {
    await this.mailerService.sendMail({
      from: `SSUGANGPYEONG <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'SSUGANGPYEONG Login Verification',
      template: 'loginMail',
      context: {
        loginCode,
      },
    });
  }

  async userDeleteSend(userId: string, email: string) {
    // Send email to user
    await this.mailerService.sendMail({
      from: `SSUGANGPYEONG <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'SSUGANGPYEONG User Delete Successfully Requested',
      template: 'userDeleteMail',
    });

    // Send email to admin
    await this.mailerService.sendMail({
      from: `SSUGANGPYEONG <${process.env.EMAIL_USER}>`,
      to: this.configService.get('email.admin'),
      subject: `SSUGANGPYEONG User Delete Requested: ${email}`,
      template: 'adminUserDeleteMail',
      context: {
        userId,
      },
    });
  }

  async boardAnalysisSend(email: string, boardPosts: BoardPost[]) {
    await this.mailerService.sendMail({
      from: `SSUGANGPYEONG <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'SSU BE ver2 Board report',
      template: 'boardAnalysisMail',
      context: {
        boardPosts,
      },
    });
  }

  async reportCourseReview(reporterId: string, courseReviewId: string) {
    await this.mailerService.sendMail({
      from: `SSUGANGPYEONG <${process.env.EMAIL_USER}>`,
      to: this.configService.get('email.user'),
      subject: `Course Review Report from ${reporterId}`,
      template: 'reportCourseReviewMail',
      context: {
        type: 'Course Review',
        courseReviewId,
        reporterId,
      },
    });
  }

  async reportBoardPost(
    reporterId: string,
    postId: string,
    title: string,
    contents: string,
  ) {
    await this.mailerService.sendMail({
      from: `SSUGANGPYEONG <${process.env.EMAIL_USER}>`,
      to: this.configService.get('email.user'),
      subject: `Board Post Report from ${reporterId}`,
      template: 'reportPostMail',
      context: {
        type: 'Board Post',
        reporterId,
        postId,
        title,
        contents,
      },
    });
  }

  async reportBoardComment(
    reporterId: string,
    commentId: string,
    postId: string,
    text: string,
  ) {
    await this.mailerService.sendMail({
      from: `SSUGANGPYEONG <${process.env.EMAIL_USER}>`,
      to: this.configService.get('email.user'),
      subject: `Board Comment Report from ${reporterId}`,
      template: 'reportCommentMail',
      context: {
        type: 'Board Comment',
        reporterId,
        commentId,
        postId,
        text,
      },
    });
  }
}
