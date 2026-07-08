import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service.js';
import { EMAIL_PROVIDER } from './interfaces/email-provider.interface.js';
import { ResendProvider } from './providers/resend.provider.js';
import { SmtpProvider } from './providers/smtp.provider.js';

@Module({
  providers: [
    {
      provide: EMAIL_PROVIDER,
      useFactory: (config: ConfigService) => {
        const provider = config.get<string>('MAIL_PROVIDER') ?? 'resend';
        if (provider === 'smtp') return new SmtpProvider(config);
        return new ResendProvider(config);
      },
      inject: [ConfigService],
    },
    MailService,
  ],
  exports: [MailService],
})
export class MailModule {}
