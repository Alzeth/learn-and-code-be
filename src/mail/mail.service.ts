import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EMAIL_PROVIDER } from './interfaces/email-provider.interface';
import type { IEmailProvider } from './interfaces/email-provider.interface';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly from: string;
  private readonly appUrl: string;

  constructor(
    @Inject(EMAIL_PROVIDER) private readonly provider: IEmailProvider,
    private readonly config: ConfigService,
  ) {
    this.from = this.config.get<string>('MAIL_FROM') ?? 'no-reply@learn-and-code.app';
    this.appUrl = this.config.get<string>('APP_URL') ?? 'http://localhost:4200';
  }

  async sendPasswordReset(to: string, token: string): Promise<void> {
    const resetUrl = `${this.appUrl}/reset-password?token=${token}`;

    await this.provider
      .send({
        from: this.from,
        to,
        subject: 'Reset your password',
        text: `Use the link below to reset your password. It expires in 15 minutes.\n\n${resetUrl}\n\nIf you did not request this, ignore this email.`,
        html: `
          <p>Use the link below to reset your password. It expires in <strong>15 minutes</strong>.</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>If you did not request this, ignore this email.</p>
        `,
      })
      .catch((err: unknown) => {
        this.logger.error('Failed to send password reset email', err);
      });
  }
}
