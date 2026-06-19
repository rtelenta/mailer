# Proposal: Add API Token Management

## What

Let authenticated users create, list, and revoke personal API tokens from the account settings page. Tokens are all-or-nothing (no scopes), stored as a hash in the database, with the plaintext shown exactly once on creation. Each token displays a `lastUsedAt` timestamp in the list so users can audit which tokens are active.

## Why

The mailer platform exposes a public API (`/api/*`), but currently has no way for users to authenticate programmatic clients. API tokens are the standard mechanism: long-lived credentials that a script or integration can use instead of the SSO session. Without them, the public API cannot be used from outside a browser session.

The "API Tokens" section is already stubbed in the account settings page (`features/account/pages/AccountSettingsPage.tsx`) as a "coming soon" placeholder. This change replaces that stub with a fully functional panel.

## Scope

**In scope:**
- DB table for storing token hashes + metadata (`name`, `prefix`, `lastUsedAt`)
- API endpoints: `POST /api/tokens` (create), `GET /api/tokens` (list), `DELETE /api/tokens/:id` (revoke)
- Plaintext token shown once in a modal/alert after creation (cannot be retrieved again)
- Token list with name, truncated prefix, last-used-at, and revoke action
- Inline token creation form (name input + "Create Token" button) within the API Tokens section
- `lastUsedAt` updated when a token is used to authenticate a request (middleware touch)
- i18n keys in `locales/en.json` for all UI strings

**Out of scope:**
- Token scopes / permissions
- Token expiry
- Rate limiting per token
- Programmatic API usage (the public API itself is a separate capability)
- Email notification on token creation or revocation

## Dependencies

- `add-account-settings-page` — the settings page layout and section structure this change extends
