## Context

The `@better-auth/oauth-provider` plugin handles the SSO server side of the OAuth2 authorization code flow. When an unauthenticated user hits `/api/auth/oauth2/authorize`, the plugin:
1. Signs the OAuth2 request params (adds `exp`, `ba_iat`, `sig`, etc.)
2. Redirects the browser to `loginPage` (configured as `/sign-in`) with those signed params in the URL query string

After the user authenticates, the plugin's `before` hook (triggered when `ctx.body.oauth_query` is present) verifies the signed params and stores them as request-scoped state. Its `after` hook (triggered when a new session cookie appears in the response) reads that state and calls `runOAuth2Authorize` to issue the authorization code and redirect to the mailer's callback.

**Two bugs in the SSO block this flow:**

**Bug 1 — Sign-in page premature redirect** (`app/(auth)/sign-in/page.tsx`):
```ts
// Fires BEFORE the user sees the form
if (typeof redirectUri === "string" && redirectUri) {
  redirect(`/api/oauth/start?${qs.toString()}`);
}
```
When the browser arrives at `/sign-in?redirect_uri=...&state=...&sig=...`, the Next.js server component detects `redirect_uri` in `searchParams` and immediately redirects to `/api/oauth/start`. That route does not exist in the SSO's Hono app → 404. The user never sees the credential form.

**Bug 2 — Missing `oauthProviderClient()` in `lib/auth-client.ts`**:
The `@better-auth/oauth-provider` ships a client plugin (`oauthProviderClient`) that attaches a `fetchPlugin`. On every non-GET request, the fetch plugin reads `window.location.search` (the current URL's signed OAuth2 params) and appends:
```json
{ "oauth_query": "<signed_query_string>" }
```
to the request body. Without this plugin, `oauth_query` is never sent, the server-side `before` hook never fires, and after login the plugin has no stored OAuth2 state to resume — so the user lands on `/` (from `router.push("/")`) with no authorization code issued.

## Goals / Non-Goals

**Goals:**
- User can complete the full SSO → mailer OAuth2 login without hitting a 404 or ending up stranded at `/`
- `@better-auth/oauth-provider`'s built-in mechanism (request state via `oauth_query`) is used as intended — no custom endpoint needed

**Non-Goals:**
- Consent screen (not configured in the SSO)
- Sign-up flow from the OAuth2 path
- Any changes to the mailer project

## Decisions

**Remove the `/api/oauth/start` redirect entirely.** The sign-in page should just render `<SignInPage />` unconditionally. The signed OAuth2 params are already in the URL when the browser arrives; `oauthProviderClient` will read `window.location.search` and pass them as `oauth_query` automatically. No server-side forwarding logic is needed.

**Add `oauthProviderClient()` as a plugin in `lib/auth-client.ts`.** This is the official mechanism provided by `@better-auth/oauth-provider` for exactly this use case. It requires no schema changes and no manual plumbing.

**Do not modify `useSignIn`.** After login in an OAuth2 flow, the server returns `{ url: <callback_url>, redirect: true }`. Better-auth's built-in `redirectPlugin` fires `window.location.href = url`, causing a hard navigation that supersedes the `router.push("/")` from `useSignIn.onSuccess`. No conflict in practice.

## Risks / Trade-offs

- **None significant.** Both changes are purely additive at the client level; no DB schema or API surface changes.
- `window.location.search` read by `oauthProviderClient` will be an empty string on normal (non-OAuth) sign-ins — `buildSignedOAuthQuery("")` is expected to produce a value that the server-side `before` hook accepts silently (the hook already validates the signature and ignores invalid/empty queries).
