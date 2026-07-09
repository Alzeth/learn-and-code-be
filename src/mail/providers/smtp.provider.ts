import type { ConfigService } from '@nestjs/config';
import type { Transporter } from 'nodemailer';
import * as nodemailer from 'nodemailer';

import type { EmailMessage, IEmailProvider } from '../interfaces/email-provider.interface';

export class SmtpProvider implements IEmailProvider {
  private readonly transporter: Transporter;

  constructor(private readonly config: ConfigService) {
    const port = this.config.get<number>('SMTP_PORT') ?? 587;

    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST'),
      port,
      secure: port === 465,
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
    });
  }

  async send(message: EmailMessage): Promise<void> {
    await this.transporter.sendMail({
      from: message.from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });
  }
}
