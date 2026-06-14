## Why

The SSO's OAuth client record has `redirect_uris: ["http://localhost:3006/api/auth/callback/sso"]` but better-auth's `@better-auth/sso` plugin generates `redirect_uri=http://localhost:3006/api/auth/sso/callback/internal` on every authorization request. The SSO performs strict equality matching and rejects the mismatch with `invalid_redirect`.

## What Changes

- The SSO OAuth client's `redirect_uris` entry for the mailer client is updated to `http://localhost:3006/api/auth/sso/callback/internal` — the URI better-auth actually calls back to.
- A Hono compatibility route is added at `GET /api/auth/callback/sso` that proxies to better-auth's callback handler; this bridges any existing sessions/bookmarks and ensures future SSO client registrations that use the legacy path still work gracefully.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `sso-auth`: the redirect URI used in the OAuth2 authorization code flow must match what `@better-auth/sso` generates (`/api/auth/sso/callback/:providerId`). Update the spec requirement for the login redirect to be explicit about the correct callback path.

## Impact

- **SSO configuration** (external): one `redirect_uris` value updated on the SSO's `oauth_client` row for `mailer-dev`.
- **`lib/api/index.ts`**: one new Hono route added as a bridge.
- No environment variable changes.
- No database migrations.
- No breaking API changes.

## Non-goals

- Changing better-auth's callback URL generation or patching the `@better-auth/sso` plugin.
- Supporting multiple redirect URIs or dynamic environments (prod, staging) — each environment has its own SSO client registration.
