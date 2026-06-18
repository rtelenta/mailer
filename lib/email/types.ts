export interface EmailDefaults {
  subject: string;
  fromName: string;
  fromAddress: string;
  replyTo?: string;
  preheader?: string;
}

export interface SendEmailParams {
  to: string;
  mjml: string;
  content: Record<string, unknown>;
  defaults: EmailDefaults;
  overrides?: Partial<EmailDefaults>;
}

export interface ProviderSendParams {
  html: string;
  subject: string;
  fromName: string;
  fromAddress: string;
  replyTo?: string;
  to: string;
}

export type EmailResult =
  | { ok: true; messageId: string }
  | { ok: false; code: string; message: string };

export interface EmailProvider {
  send(params: ProviderSendParams): Promise<EmailResult>;
}
