# Proposal: add-public-api-v1-send-endpoint

## What

Add a versioned public API endpoint — `POST /api/v1/send` — that external services can call to send a transactional email using a stored template. The caller identifies the template by name, supplies Handlebars variable values, and optionally overrides per-send fields (subject, from-name, reply-to, preheader). The endpoint authenticates via API token (Bearer), renders the template through the existing email delivery service, and returns a normalized send result.

## Why

The app has all the building blocks — stored MJML templates, a Handlebars + MJML rendering pipeline, a Resend-backed delivery service, and API token authentication — but no public HTTP surface that ties them together. External services (CI pipelines, backend jobs, other SaaS tools) need a single endpoint they can `POST` to in order to trigger a rendered, delivered email without involving the browser UI.

## Scope

**In scope:**
- `POST /api/v1/send`: resolve template by name, render, deliver, return result
- Bearer token authentication via the existing `getRequestUserId` utility
- Recipient field `to`: a single email address string or an array of email address strings
- Optional per-send overrides: `subject`, `fromName`, `replyTo`, `preheader`
- Zod input validation with 422 on failure
- Returns `{ messageId }` on success, structured error body on failure

**Out of scope:**
- CC / BCC recipients
- Attachments
- Scheduling / queued delivery
- Per-user or per-token rate limiting (a future concern)
- Webhook delivery receipts
- Template lookup by ID (name is the external-facing stable identifier)

## Dependencies

- `add-api-token-management`: Bearer token auth via `getRequestUserId`
- `add-email-delivery-service`: `sendEmail` service function
- `add-template-management`: `templates` DB table with `mjml`, `subject`, `fromName`, `replyTo`, `preheader` columns
