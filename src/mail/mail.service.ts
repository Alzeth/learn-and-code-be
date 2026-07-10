import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { IEmailProvider } from './interfaces/email-provider.interface';
import { EMAIL_PROVIDER } from './interfaces/email-provider.interface';

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
    const templateId = this.config.get<string>('RESEND_TEMPLATE_RESET_PASSWORD') ?? '';

    await this.provider
      .send({ from: this.from, to, templateId, templateVariables: { resetUrl } })
      .catch((err: unknown) => {
        this.logger.error('Failed to send password reset email', err);
      });
  }
}
