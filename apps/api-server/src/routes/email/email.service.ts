import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Board } from '../../entity/board.entity';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async send(email: string, boards: Board[]) {
    const data = boards.map(({ id, title, views }) => {
      return `<tr><td>${id}</td><td>${title}</td><td>${views}</td></tr>`;
    });

    await this.mailerService.sendMail({
      from: `SSUGANGPYEONG <${process.env.NODEMAILER_USER}>`,
      to: email,
      subject: 'SSU BE ver2 Board report',
      html: `
<table style="border: 1px solid black; width:60%; margin: auto; text-align: center;">
  <tr>
    <th>id</th>
    <th>title</th>
    <th>view count</th>
    ${data}
  </tr>
</table>
      `,
    });
  }
}
