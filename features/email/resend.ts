import 'server-only';
import { Resend } from 'resend';
import { RESEND_API_KEY } from '@/lib/constants';
import type { EmailProvider, EmailResult, ProviderSendParams } from './types';

export class ResendEmailProvider implements EmailProvider {
  private client: Resend;

  constructor() {
    this.client = new Resend(RESEND_API_KEY);
  }

  async send(params: ProviderSendParams): Promise<EmailResult> {
    try {
      const { data, error } = await this.client.emails.send({
        to: params.to,
        from: `"${params.fromName}" <${params.fromAddress}>`,
        subject: params.subject,
        html: params.html,
        ...(params.replyTo ? { replyTo: params.replyTo } : {}),
      });

      if (error) {
        return { ok: false, code: 'RESEND_ERROR', message: error.message };
      }

      if (!data?.id) {
        return { ok: false, code: 'RESEND_NO_ID', message: 'No message ID returned' };
      }

      return { ok: true, messageId: data.id };
    } catch (err) {
      return {
        ok: false,
        code: 'RESEND_EXCEPTION',
        message: err instanceof Error ? err.message : String(err),
      };
    }
  }
}
