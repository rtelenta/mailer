## Why

`POST /api/templates/:id/test-send` returns `{ ok: false, code: "RESEND_ERROR", message: "Invalid 'from' field..." }`. Two bugs in `lib/email/resend.ts` are responsible:

1. **Unquoted display name in `from`**: The code builds `` `${fromName} <${fromAddress}>` ``. When `fromName` contains RFC 2822 special characters (commas, parentheses, angle brackets, etc.), the resulting string is not a valid address header and Resend rejects it. Fix: wrap the display name in double-quotes — `"Name" <email>` is always valid regardless of the name's content.

2. **Wrong field name for `replyTo`**: The code spreads `{ reply_to: params.replyTo }` directly into the SDK call. Resend SDK v6's `parseEmailToApiOptions` maps `email.replyTo → reply_to` for the API — it does not pass through a bare `reply_to` property from the caller. The replyTo value is silently dropped on every send. Fix: pass `replyTo` (camelCase).

## What Changes

- `lib/email/resend.ts`: quote the display name in the `from` field; change `reply_to` spread to `replyTo`

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `email-delivery`: updates FR-4 (Send) — the `from` header MUST use the RFC 2822 quoted-string format for the display name; `replyTo` MUST be passed using the Resend SDK's camelCase key

## Impact

- `lib/email/resend.ts` — 2-line change
- No DB changes, no API contract changes, no new dependencies
