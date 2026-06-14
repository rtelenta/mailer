## 1. SSO Client Registration

- [x] 1.1 Update the SSO `oauth_client` row for `mailer-dev`: set `redirect_uris` to `["http://localhost:3006/api/auth/sso/callback/internal"]` (run against the SSO's database, not mailer's)

## 2. Hono Compatibility Bridge

- [x] 2.1 In `lib/api/index.ts`, add `app.get("/auth/callback/sso", ...)` **before** the wildcard `/auth/*` route — it rewrites the pathname to `/api/auth/sso/callback/internal` and forwards the request to `auth.handler`
