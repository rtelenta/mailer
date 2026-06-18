import 'server-only';
import { compileMjml, renderHandlebars } from './renderer';
import { ResendEmailProvider } from './resend';
import type { EmailDefaults, EmailProvider, EmailResult, SendEmailParams } from './types';

export type { EmailDefaults, EmailProvider, EmailResult, SendEmailParams };
export type { ProviderSendParams } from './types';

const provider: EmailProvider = new ResendEmailProvider();

export async function sendEmail(params: SendEmailParams): Promise<EmailResult> {
  const compiled = await compileMjml(params.mjml);
  if ('error' in compiled) {
    return { ok: false, code: 'MJML_COMPILE_ERROR', message: compiled.error };
  }

  const html = renderHandlebars(compiled.html, params.content);

  const envelope: EmailDefaults = { ...params.defaults, ...params.overrides };

  return provider.send({
    to: params.to,
    html,
    subject: envelope.subject,
    fromName: envelope.fromName,
    fromAddress: envelope.fromAddress,
    replyTo: envelope.replyTo,
  });
}
