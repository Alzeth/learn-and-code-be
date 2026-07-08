import { Resend } from 'resend';
import type { ConfigService } from '@nestjs/config';
import type { IEmailProvider, EmailMessage } from '../interfaces/email-provider.interface.js';

export class ResendProvider implements IEmailProvider {
  private readonly client: Resend;

  constructor(private readonly config: ConfigService) {
    this.client = new Resend(this.config.get<string>('RESEND_API_KEY'));
  }

  async send(message: EmailMessage): Promise<void> {
    const { error } = await this.client.emails.send({
      from: message.from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });

    if (error) throw new Error(`Resend delivery failed: ${error.message}`);
  }
}
