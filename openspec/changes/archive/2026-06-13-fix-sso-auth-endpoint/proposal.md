## Why

After the SSO's `@better-auth/oauth-provider` redirects unauthenticated OAuth2 requests to the SSO's `/sign-in` page, the sign-in page server component intercepts the URL params and hard-redirects to `/api/oauth/start` — an endpoint that does not exist — causing a 404. Additionally, the SSO's `authClient` is missing the `oauthProviderClient()` plugin, which is the mechanism that injects the signed OAuth2 state (`oauth_query`) into every sign-in request so `@better-auth/oauth-provider` can resume the flow after login.

## What Changes

- **Remove** the premature `/api/oauth/start` redirect from the SSO's sign-in page server component
- **Add** `oauthProviderClient()` to the SSO's `createAuthClient` so that `oauth_query` is automatically appended to every non-GET sign-in request

No changes to the mailer project are required; the mailer is already generating the correct authorization URL (`/api/auth/oauth2/authorize`).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `sso-auth`: The SSO login flow now correctly completes — the sign-in page shows the credential form, `oauth_query` is forwarded with the sign-in POST, and `@better-auth/oauth-provider` resumes the OAuth2 code exchange and redirects back to the mailer's callback URL.

## Impact

- **Files changed** (SSO project):
  - `app/(auth)/sign-in/page.tsx` — remove `/api/oauth/start` redirect
  - `lib/auth-client.ts` — add `oauthProviderClient()` plugin
- **No DB changes, no API changes, no mailer changes**
- **No breaking changes**
- **Env vars:** none new
