## Why

The platform needs a reliable, testable way to compile, render, and send emails before either test-send or the public API can be built. Without a shared delivery service, both features would duplicate provider coupling, rendering logic, and error normalization.

## What Changes

- New internal service module (`lib/email/`) that owns the full email-send pipeline
- MJML-to-HTML compilation step, run server-side
- Handlebars variable rendering against a caller-supplied content object
- Template defaults (subject, from-name, reply-to, preheader) applied at send time, with optional per-call overrides
- Provider-agnostic `EmailProvider` interface with a Resend implementation
- Normalized `EmailResult` return type (success + message ID, or typed error)
- New environment variable: `RESEND_API_KEY`

## Capabilities

### New Capabilities

- `email-delivery`: Internal service that compiles MJML → HTML, renders Handlebars variables, applies template defaults with per-call overrides, and sends via a pluggable provider. Returns a normalized success/error result.

### Modified Capabilities

_(none — no existing spec-level requirements change)_

## Impact

- **New files**: `lib/email/` module (provider interface, Resend adapter, renderer, send service)
- **Dependencies**: `resend` SDK (already in tech stack), `mjml` for compilation, `handlebars` for variable rendering
- **Environment variables**: `RESEND_API_KEY` (server-side only)
- **No UI changes**; no DB schema changes; no API route changes at this stage
- **Non-goals**: No public API route, no test-send UI, no queue/retry logic, no multi-provider routing, no email tracking/analytics
