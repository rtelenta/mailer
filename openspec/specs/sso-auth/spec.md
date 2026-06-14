# Spec: SSO Auth

## Purpose

Defines the authentication layer for the mailer project: integrating better-auth as an OAuth2 client against an internal SSO provider, exposing auth API routes via Hono, persisting sessions via Drizzle, protecting all non-auth routes via middleware, and providing login/logout flows.

## Requirements

### Requirement: better-auth is configured as an OAuth2 client for the internal SSO
The system SHALL configure `better-auth` in `lib/auth.ts` using the `@better-auth/sso` plugin with no `defaultSSO` array. The plugin SHALL resolve the SSO provider at runtime by querying the `sso_provider` table. It SHALL use the Drizzle adapter backed by the existing `db` singleton. The `BETTER_AUTH_SECRET` env var SHALL be used as the signing secret. The config MUST NOT hardcode credentials or endpoint URLs — all runtime values SHALL come from the database row seeded by `db/seed.ts`.

#### Scenario: Auth config initializes without error
- **WHEN** the server module `lib/auth.ts` is imported
- **THEN** the `auth` export is a valid better-auth instance with the SSO plugin registered and no `defaultSSO`

#### Scenario: Missing auth env vars at startup
- **WHEN** `SSO_BASE_URL`, `SSO_CLIENT_ID`, `SSO_CLIENT_SECRET`, or `BETTER_AUTH_SECRET` is undefined
- **THEN** the application SHALL throw at startup rather than silently proceeding with broken auth

### Requirement: SSO provider is seeded into the database
The system SHALL provide a seed script at `db/seed.ts` that inserts the internal SSO provider row into the `sso_provider` table using values from env vars (`SSO_BASE_URL`, `SSO_CLIENT_ID`, `SSO_CLIENT_SECRET`). The seed MUST use an upsert (conflict on `provider_id`) so it is safe to run multiple times. The `oidc_config` column MUST be populated as a JSON string containing `issuer`, `clientId`, `clientSecret`, `discoveryEndpoint`, `authorizationEndpoint`, `tokenEndpoint`, and `scopes`. A `db:seed` npm script SHALL be added to `package.json` to run this file.

#### Scenario: Seed inserts provider on fresh database
- **WHEN** `bun run db:seed` is run against a migrated but empty database
- **THEN** a row is inserted into `sso_provider` with `provider_id = "internal"`, the correct `domain`, and a valid `oidc_config` JSON string

#### Scenario: Seed is idempotent
- **WHEN** `bun run db:seed` is run a second time
- **THEN** the existing row is updated and no error is thrown

#### Scenario: Sign-in resolves provider from DB
- **WHEN** a client POSTs to `POST /api/auth/sign-in/sso` after the seed has been run
- **THEN** better-auth resolves the provider from the `sso_provider` table and returns a redirect to the SSO authorization endpoint

### Requirement: Auth API routes are served under /api/auth/* via Hono
The system SHALL register a Hono route that forwards all `GET` and `POST` requests matching `/api/auth/*` to the better-auth fetch handler. No separate Next.js route SHALL exist for auth — all API traffic routes through the single Hono catch-all.

#### Scenario: Sign-in endpoint responds
- **WHEN** a client sends `POST /api/auth/sign-in/sso`
- **THEN** better-auth processes the request and returns a redirect to the SSO authorization endpoint

#### Scenario: Session endpoint responds
- **WHEN** a client sends `GET /api/auth/get-session` with a valid session cookie
- **THEN** better-auth returns a JSON response containing the session and user data

### Requirement: Drizzle schema defines the four better-auth tables
The system SHALL define `user`, `session`, `account`, and `verification` tables in `db/schema/auth.ts` compatible with better-auth's Drizzle adapter. User IDs SHALL be UUID v7 strings. All tables SHALL be registered in the Drizzle config so migrations can be generated.

#### Scenario: Migration generation includes auth tables
- **WHEN** the developer runs `bun run db:generate`
- **THEN** a migration file is created containing `CREATE TABLE` statements for `user`, `session`, `account`, and `verification`

#### Scenario: Session is persisted after login
- **WHEN** a user completes the SSO callback flow
- **THEN** a row is created in the `session` table and a session cookie is set on the response

### Requirement: All non-auth routes require an authenticated session
The system SHALL have a Next.js middleware (`middleware.ts`) that checks for a valid better-auth session on every request. Requests to paths starting with `/login` or `/api/auth` SHALL be excluded from the check. Unauthenticated requests to any other path SHALL be redirected to `/login`.

#### Scenario: Authenticated user accesses a protected page
- **WHEN** a user with a valid session cookie navigates to any protected route
- **THEN** the middleware allows the request through without redirect

#### Scenario: Unauthenticated user accesses a protected page
- **WHEN** a user with no session cookie navigates to any route other than `/login` or `/api/auth/*`
- **THEN** the middleware redirects to `/login`

#### Scenario: Public paths are always accessible
- **WHEN** any request (authenticated or not) targets `/login` or `/api/auth/*`
- **THEN** the middleware allows it through without checking the session

### Requirement: Login page redirects users to the SSO
The system SHALL have a `/login` page rendered by `features/auth/pages/LoginPage.tsx`. It SHALL display a "Sign in with SSO" button. Clicking it SHALL trigger the better-auth SSO sign-in flow, redirecting the browser to the SSO authorization endpoint. The `redirect_uri` in the authorization request MUST be `{NEXT_PUBLIC_APP_URL}/api/auth/sso/callback/internal` — the path generated by `@better-auth/sso`. The SSO OAuth client registration for this app MUST include this exact URI in its `redirect_uris` list. All visible text SHALL use `t()` with keys in `locales/en.json`.

The SSO's `@better-auth/oauth-provider` will redirect the browser to the SSO's `/sign-in` page with signed OAuth2 params in the URL query string. The SSO's sign-in page MUST render the credential form unconditionally — it MUST NOT redirect to `/api/oauth/start` or any other intermediate endpoint. The SSO's `authClient` MUST include the `oauthProviderClient()` plugin so that the signed OAuth2 state (`oauth_query`) is automatically forwarded with the sign-in POST, enabling `@better-auth/oauth-provider` to issue the authorization code and redirect back to the mailer's callback after login.

#### Scenario: User lands on /login
- **WHEN** an unauthenticated user is redirected to `/login`
- **THEN** a page with a "Sign in" button is displayed

#### Scenario: User clicks sign in
- **WHEN** the user clicks the "Sign in with SSO" button
- **THEN** the browser is redirected to the SSO authorization endpoint with `client_id=<SSO_CLIENT_ID>`, `redirect_uri=<NEXT_PUBLIC_APP_URL>/api/auth/sso/callback/internal`, `scope=openid email profile`, and a `state` parameter

#### Scenario: SSO validates the redirect_uri
- **WHEN** the SSO authorization endpoint receives the request
- **THEN** the `redirect_uri` matches a registered URI on the SSO client and the request is not rejected with `invalid_redirect`

#### Scenario: SSO sign-in page shows credential form
- **WHEN** the SSO's `@better-auth/oauth-provider` redirects the browser to the SSO `/sign-in` page as part of the OAuth2 flow
- **THEN** the sign-in page renders the credential form immediately without redirecting to any intermediate endpoint

#### Scenario: OAuth2 flow completes after SSO login
- **WHEN** the user submits valid credentials on the SSO sign-in page
- **THEN** `@better-auth/oauth-provider` issues an authorization code and redirects the browser back to `{NEXT_PUBLIC_APP_URL}/api/auth/sso/callback/internal?code=<code>&state=<state>`, completing the login on the mailer side

### Requirement: Logout revokes the SSO token and destroys the local session
The system SHALL expose a logout action (e.g., `POST /api/auth/sign-out`) that revokes the refresh token on the SSO via `POST {SSO_BASE_URL}/api/auth/oauth2/revoke` before destroying the local session. After logout, the user SHALL be redirected to `/login`.

#### Scenario: User logs out
- **WHEN** the user triggers logout
- **THEN** the refresh token is revoked on the SSO, the local session is destroyed, and the user is redirected to `/login`

#### Scenario: SSO revocation fails
- **WHEN** the revocation request to the SSO fails (e.g., network error or 5xx)
- **THEN** the local session is still destroyed and the user is redirected to `/login` (best-effort revocation)

### Requirement: A compatibility route bridges legacy redirect URIs to the better-auth callback handler
The system SHALL expose a Hono route at `GET /api/auth/callback/sso` that forwards the SSO callback (query params `code` and `state`) to better-auth's actual callback handler at `/api/auth/sso/callback/internal`. This allows the SSO client to be re-registered from the old URI to the correct one without breaking in-flight sessions, and provides a fallback for any environment where the SSO client was registered with the `/api/auth/callback/sso` path.

#### Scenario: SSO redirects to the legacy callback path
- **WHEN** the SSO redirects the browser to `GET /api/auth/callback/sso?code=<code>&state=<state>`
- **THEN** the Hono route proxies the request to better-auth's `/api/auth/sso/callback/internal` handler with the same query parameters and the session is established
