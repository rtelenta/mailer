## ADDED Requirements

### Requirement: better-auth is configured as an OAuth2 client for the internal SSO
The system SHALL configure `better-auth` in `lib/auth.ts` using the `@better-auth/sso` plugin pointed at `SSO_BASE_URL`. It SHALL use the Drizzle adapter backed by the existing `db` singleton. The `BETTER_AUTH_SECRET` env var SHALL be used as the signing secret. The config MUST NOT hardcode credentials — all values SHALL come from `lib/constants.ts`.

#### Scenario: Auth config initializes without error
- **WHEN** the server module `lib/auth.ts` is imported
- **THEN** the `auth` export is a valid better-auth instance with the SSO plugin registered

#### Scenario: Missing auth env vars at startup
- **WHEN** `SSO_BASE_URL`, `SSO_CLIENT_ID`, `SSO_CLIENT_SECRET`, or `BETTER_AUTH_SECRET` is undefined
- **THEN** the application SHALL throw at startup rather than silently proceeding with broken auth

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
The system SHALL have a `/login` page rendered by `features/auth/pages/LoginPage.tsx`. It SHALL display a "Sign in with SSO" button. Clicking it SHALL trigger the better-auth SSO sign-in flow, redirecting the browser to the SSO authorization endpoint. All visible text SHALL use `t()` with keys in `locales/en.json`.

#### Scenario: User lands on /login
- **WHEN** an unauthenticated user is redirected to `/login`
- **THEN** a page with a "Sign in" button is displayed

#### Scenario: User clicks sign in
- **WHEN** the user clicks the "Sign in with SSO" button
- **THEN** the browser is redirected to the SSO `authorization` endpoint with correct `client_id`, `redirect_uri`, `scope`, and `state` parameters

### Requirement: Logout revokes the SSO token and destroys the local session
The system SHALL expose a logout action (e.g., `POST /api/auth/sign-out`) that revokes the refresh token on the SSO via `POST {SSO_BASE_URL}/api/auth/oauth2/revoke` before destroying the local session. After logout, the user SHALL be redirected to `/login`.

#### Scenario: User logs out
- **WHEN** the user triggers logout
- **THEN** the refresh token is revoked on the SSO, the local session is destroyed, and the user is redirected to `/login`

#### Scenario: SSO revocation fails
- **WHEN** the revocation request to the SSO fails (e.g., network error or 5xx)
- **THEN** the local session is still destroyed and the user is redirected to `/login` (best-effort revocation)
