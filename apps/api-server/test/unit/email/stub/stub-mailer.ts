import { MailerService } from '@nestjs-modules/mailer';

export class StubMailerService extends MailerService {
  from: string;
  to: string;
  subject: string;
  template: string;
  context: any;

  constructor() {
    super(
      {
        transport: {
          host: null,
          port: null,
        },
      },
      null,
    );
  }

  async sendMail(options: any): Promise<void> {
    this.from = options.from;
    this.to = options.to;
    this.subject = options.subject;
    this.template = options.template;
    this.context = options.context;
  }
}
