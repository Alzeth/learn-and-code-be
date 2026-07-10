import type { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

import type { EmailMessage, IEmailProvider } from '../interfaces/email-provider.interface';

export class ResendProvider implements IEmailProvider {
  private readonly client: Resend;

  constructor(private readonly config: ConfigService) {
    this.client = new Resend(this.config.get<string>('RESEND_API_KEY'));
  }

  async send(message: EmailMessage): Promise<void> {
    const result = message.templateId
      ? await this.client.emails.send({
          from: message.from,
          to: message.to,
          template: { id: message.templateId, variables: message.templateVariables ?? {} },
        })
      : await this.client.emails.send({
          from: message.from,
          to: message.to,
          subject: message.subject ?? '',
          html: message.html ?? '',
          text: message.text ?? '',
        });

    if (result.error) throw new Error(`Resend delivery failed: ${result.error.message}`);
  }
}
