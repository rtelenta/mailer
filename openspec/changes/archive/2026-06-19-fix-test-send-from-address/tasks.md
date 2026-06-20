## 1. Email Service Guard

- [x] 1.1 In `lib/email/index.ts`, add a guard at the top of `sendEmail`: if `FROM_ADDRESS` is falsy, return `{ ok: false, code: 'MISSING_FROM_ADDRESS', message: 'FROM_ADDRESS env var is not configured' }` without calling `provider.send()`

## 2. Environment Configuration

- [x] 2.1 Add `FROM_ADDRESS=onboarding@resend.dev` to `.env`
- [x] 2.2 Add `FROM_ADDRESS=` to `.env.example` with an inline comment: `# Verified sender address (e.g. onboarding@resend.dev for Resend sandbox, or noreply@yourdomain.com)`
