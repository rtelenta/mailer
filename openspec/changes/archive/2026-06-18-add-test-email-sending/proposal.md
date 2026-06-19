# Proposal: add-test-email-sending

## What

Add a "Send Test Email" action to the template editor that sends the current template to the logged-in user's own email address. The feature uses the existing email delivery service and respects the template's sample Handlebars data already entered in the editor. A hard rate limit of 100 test emails per user per day protects against accidental spam.

## Why

Template authors need to verify how an email looks in a real inbox before sending it to recipients. The MJML preview pane shows compiled output, but it cannot replicate inbox-specific rendering (fonts, image blocking, dark mode). A one-click "send to myself" action closes this gap without exposing arbitrary send-to functionality.

## Scope

### In scope
- `POST /api/templates/:id/test-send` endpoint that sends a compiled, Handlebars-rendered email to the authenticated user's address
- Per-user, per-day rate limit (cap: 100) enforced server-side using a new `test_email_sends` counter table
- "Send Test" button in the template editor header, wired to the sample data already in the editor
- Inline feedback (loading, success toast, error inline message) in the editor UI
- i18n strings in `locales/en.json`

### Out of scope
- Sending to arbitrary email addresses
- Per-template or per-organization limits
- Persistent send history/log visible to the user
- Scheduling or batching test sends
