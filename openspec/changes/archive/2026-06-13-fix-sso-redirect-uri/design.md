## Context

better-auth's `@better-auth/sso` plugin hardcodes the OAuth2 callback path as `{baseURL}/sso/callback/{providerId}`. For this app, that resolves to `http://localhost:3006/api/auth/sso/callback/internal`. The SSO's `oauth_client` row for `mailer-dev` was originally registered with `redirect_uris: ["http://localhost:3006/api/auth/callback/sso"]` — the wrong path. The SSO performs strict string equality on `redirect_uri` during authorize, so every sign-in attempt fails before the user even sees the SSO login page.

There are two moving parts:
1. **SSO client registration** — the external `redirect_uris` value must match what better-auth sends.
2. **Compatibility bridge in Hono** — a `GET /api/auth/callback/sso` route that proxies to better-auth's real callback handler, in case any environment still has the old URI registered or any redirect is in-flight.

## Goals / Non-Goals

**Goals:**
- Fix `invalid_redirect` so the SSO authorization flow completes.
- Add a compatibility route at the old callback path so nothing breaks if both URIs coexist temporarily.

**Non-Goals:**
- Changing better-auth's callback URL generation or patching `@better-auth/sso`.
- Supporting multiple redirect URIs for multiple environments (each environment owns its own SSO client registration).

## Decisions

### 1. Fix the SSO client registration, not the mailer code path

`@better-auth/sso` has no configuration option to override the callback URL for OIDC providers (`OIDCConfig` type has no `redirectUri` field). Intercepting and rewriting the response from `POST /api/auth/sign-in/sso` would be brittle and tightly coupled to better-auth's internal JSON shape. The correct fix is to align the SSO client registration with what better-auth generates.

**Required SSO change:**
```sql
UPDATE oauth_client
SET redirect_uris = '["http://localhost:3006/api/auth/sso/callback/internal"]'
WHERE client_id = 'mailer-dev';
```

### 2. Add a Hono bridge route at the legacy path

Even after the SSO registration is updated, a GET handler at `/api/auth/callback/sso` provides a clean fallback. The bridge rewrites the path and forwards the request to `auth.handler`, which is already mounted for all `/api/auth/*` requests:

```ts
// lib/api/index.ts
app.get("/auth/callback/sso", (c) => {
  const url = new URL(c.req.url);
  url.pathname = "/api/auth/sso/callback/internal";
  return auth.handler(new Request(url.toString(), c.req.raw));
});
```

This route must be registered **before** the wildcard `/auth/*` catch-all so Hono matches it first. Hono routes match in registration order — the wildcard would also catch this path but would pass the original pathname to better-auth which wouldn't recognize it.

## Risks / Trade-offs

- **SSO client registration is external** — the SQL must be run against the SSO's database. This is a manual step that cannot be automated from within the mailer. Document it as a prerequisite.
- **Bridge route is a server-side request fan-out** — the bridge constructs a new `Request` and passes it to `auth.handler`. This is a synchronous in-process call (no extra network hop), so performance impact is negligible.
- **State cookie domain** — the `better-auth.state` cookie is set on the mailer's origin. As long as the browser is redirected back to the same origin (mailer), the state cookie is sent regardless of which callback path is used. No risk here.
