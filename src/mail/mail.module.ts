import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { EMAIL_PROVIDER } from './interfaces/email-provider.interface';
import { ResendProvider } from './providers/resend.provider';
import { SmtpProvider } from './providers/smtp.provider';

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
