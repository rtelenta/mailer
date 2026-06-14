## Why

Downstream apps need to authenticate users before they can manage email templates or trigger sends. This service must delegate all authentication to the internal SSO via OAuth2 Authorization Code flow — users never enter passwords here.

## What Changes

- Install and configure `better-auth` with the `@better-auth/sso` plugin as an OAuth2 client
- Add Drizzle schema tables required by better-auth (users, sessions, accounts)
- Expose `better-auth` handler under `/api/auth/*` via Hono
- Add a sign-in page at `/login` that redirects to the SSO
- Add an `/auth/callback` page to receive the authorization code and complete the flow
- Protect all non-auth routes with a session middleware that redirects unauthenticated users to `/login`
- Add `SSO_BASE_URL`, `SSO_CLIENT_ID`, `SSO_CLIENT_SECRET`, and `BETTER_AUTH_SECRET` to `lib/constants.ts`
- Add logout route that revokes the refresh token on the SSO before clearing the local session

## Non-goals

- Password-based authentication — this app delegates fully to the SSO
- Social OAuth (Google, GitHub, etc.) — only the internal SSO is supported
- User management UI — no admin panel for users in this change
- Role-based access control — out of scope for this change

## Capabilities

### New Capabilities

- `sso-auth`: OAuth2 client auth via `better-auth` + `@better-auth/sso`; covers sign-in redirect, callback handling, session management, logout, and route protection

### Modified Capabilities

- `project-foundation`: Adds `SSO_BASE_URL`, `SSO_CLIENT_ID`, `SSO_CLIENT_SECRET`, and `BETTER_AUTH_SECRET` to the environment constants contract

## Impact

- **DB schema**: New tables (`user`, `session`, `account`, `verification`) managed by better-auth's Drizzle adapter
- **API**: `/api/auth/*` route group added to Hono; all existing routes gain session middleware
- **UI**: `/login` and `/auth/callback` pages added; all other pages require a valid session
- **Dependencies**: `better-auth`, `@better-auth/sso`
- **Env vars**: `SSO_BASE_URL`, `SSO_CLIENT_ID`, `SSO_CLIENT_SECRET`, `BETTER_AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`
