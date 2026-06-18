## 1. Dependencies & Environment

- [x] 1.1 Install `resend`, `mjml`, and `handlebars` packages via Bun
- [x] 1.2 Install `@types/mjml` and `@types/handlebars` (or verify bundled types)
- [x] 1.3 Add `RESEND_API_KEY` export to `lib/constants.ts`

## 2. Types

- [x] 2.1 Create `lib/email/types.ts` — define `EmailProvider`, `ProviderSendParams`, `SendEmailParams`, `EmailDefaults`, and `EmailResult` discriminated union

## 3. Renderer

- [x] 3.1 Create `lib/email/renderer.ts` — implement `compileMjml(mjml: string): { html: string } | { error: string }`
- [x] 3.2 Add `renderHandlebars(html: string, content: Record<string, unknown>): string` to `lib/email/renderer.ts`

## 4. Resend Provider

- [x] 4.1 Create `lib/email/resend.ts` — implement `ResendEmailProvider` that satisfies `EmailProvider`
- [x] 4.2 Wire `RESEND_API_KEY` from `lib/constants.ts` into the Resend SDK client inside `ResendEmailProvider`
- [x] 4.3 Map Resend SDK success/error responses to `EmailResult` — no Resend types leak beyond this file

## 5. Send Service

- [x] 5.1 Create `lib/email/index.ts` — implement `sendEmail(params: SendEmailParams): Promise<EmailResult>`
- [x] 5.2 Implement merge logic: `defaults` + `overrides` → envelope before calling the provider
- [x] 5.3 Wire the pipeline: `compileMjml` → `renderHandlebars` → merge envelope → `provider.send`
- [x] 5.4 Ensure MJML compilation errors short-circuit and return `{ ok: false }` without calling the provider
