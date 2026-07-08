export const EMAIL_PROVIDER = 'EMAIL_PROVIDER';

export interface EmailMessage {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface IEmailProvider {
  send(message: EmailMessage): Promise<void>;
}
