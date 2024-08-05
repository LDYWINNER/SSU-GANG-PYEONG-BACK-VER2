import { EmailService } from '../../../src/routes/email/email.service';
import { StubConfigService } from '../../utils/stub-config-service';
import { StubMailerService } from './stub/stub-mailer';

describe('EmailService', () => {
  let emailService: EmailService;
  let mailerService: StubMailerService;
  let configService: StubConfigService;

  beforeEach(async () => {
    mailerService = new StubMailerService();
    configService = new StubConfigService();
    emailService = new EmailService(mailerService, configService);
  });

  it('should send registration email', async () => {
    const email = 'test@example.com';
    const registerCode = '123456';
    configService.set('email.user', 'admin@example.com');

    await emailService.registerEmailSend(email, registerCode);

    expect(mailerService.from).toBe(email);
    expect(mailerService.to).toBe('admin@example.com');
    expect(mailerService.subject).toBe('SSUGANGPYEONG Register Verification');
    expect(mailerService.template).toBe('registerMail');
    expect(mailerService.context).toEqual({ registerCode });
  });

  it('should send login email', async () => {
    const email = 'test@example.com';
    const loginCode = '12';
    process.env.EMAIL_USER = 'noreply@example.com';

    await emailService.loginEmailSend(email, loginCode);

    expect(mailerService.from).toBe('SSUGANGPYEONG <noreply@example.com>');
    expect(mailerService.to).toBe(email);
    expect(mailerService.subject).toBe('SSUGANGPYEONG Login Verification');
    expect(mailerService.template).toBe('loginMail');
    expect(mailerService.context).toEqual({ loginCode });
  });
});
