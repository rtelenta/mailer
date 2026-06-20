## Why

`POST /api/templates/:id/test-send` returns 502 because `FROM_ADDRESS` is not set in `.env`. The code falls through to `FROM_ADDRESS ?? ""`, which passes an empty string as the sender address to Resend; Resend rejects it, producing a provider error that the handler maps to 502. The fix is to document and validate `FROM_ADDRESS` so missing config fails fast with a clear error instead of a confusing delivery failure.

## What Changes

- Add `FROM_ADDRESS` to `.env.example` with an inline comment explaining the expected value
- Add `FROM_ADDRESS` to `.env` with a safe Resend dev sender (`onboarding@resend.dev`)
- Add an early guard in `lib/email/index.ts`: if `FROM_ADDRESS` is falsy, return `{ ok: false, code: 'MISSING_FROM_ADDRESS', message: 'FROM_ADDRESS env var is not configured' }` before calling the provider

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `email-delivery`: adds FR for missing-config guard — when `FROM_ADDRESS` is absent the service MUST return a typed error before invoking the provider

## Impact

- `lib/email/index.ts` — add one guard before `provider.send()`
- `.env` — add `FROM_ADDRESS` entry
- `.env.example` — add `FROM_ADDRESS` entry with comment
- No DB changes, no API contract changes (502 is already the documented delivery-failure response)
