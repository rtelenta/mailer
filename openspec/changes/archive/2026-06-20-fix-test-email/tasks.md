## 1. Fix Resend Provider

- [x] 1.1 In `lib/email/resend.ts`, change the `from` field to `"${params.fromName}" <${params.fromAddress}>` (double-quotes around the display name)
- [x] 1.2 In `lib/email/resend.ts`, change `{ reply_to: params.replyTo }` to `{ replyTo: params.replyTo }` in the SDK call
