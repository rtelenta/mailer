## 1. Dependencies

- [x] 1.1 Install `better-auth` and `@better-auth/sso` via `bun add better-auth @better-auth/sso`

## 2. Environment Constants

- [x] 2.1 Add `SSO_BASE_URL`, `SSO_CLIENT_ID`, `SSO_CLIENT_SECRET`, `BETTER_AUTH_SECRET`, and `NEXT_PUBLIC_APP_URL` exports to `lib/constants.ts`
- [x] 2.2 Add corresponding placeholder values to `.env.local`

## 3. Database Schema

- [x] 3.1 Create `db/schema/auth.ts` with `user`, `session`, `account`, and `verification` tables compatible with better-auth's Drizzle adapter (UUID v7 text PKs)
- [x] 3.2 Export all auth tables from `db/schema/auth.ts` and register the schema file in `drizzle.config.ts`
- [x] 3.3 Run `bun run db:generate` to produce the auth migration file

## 4. Auth Configuration

- [x] 4.1 Create `lib/auth.ts` configuring `betterAuth` with the Drizzle adapter (`db` singleton), the `sso` plugin pointed at `SSO_BASE_URL`, and `BETTER_AUTH_SECRET` as the secret
- [x] 4.2 Add startup guard in `lib/auth.ts` (or `lib/constants.ts`) that throws if required auth env vars are missing

## 5. API Route

- [x] 5.1 Register `app.on(["GET", "POST"], "/auth/*", ...)` in `lib/api/index.ts` that forwards requests to `auth.handler(c.req.raw)`

## 6. Middleware

- [x] 6.1 Create `middleware.ts` at the project root that reads the better-auth session and redirects unauthenticated requests (excluding `/login` and `/api/auth/*`) to `/login`
- [x] 6.2 Export `config` with a `matcher` that covers all routes except `_next` and static assets

## 7. Login Page

- [x] 7.1 Add auth locale keys to `locales/en.json` (`auth.signIn`, `auth.signInTitle`, `auth.signInDescription`)
- [x] 7.2 Create `features/auth/pages/LoginPage.tsx` with a "Sign in with SSO" button that calls the better-auth SSO sign-in action
- [x] 7.3 Create `app/login/page.tsx` as a thin shell rendering `LoginPage`
- [x] 7.4 Add `app/login/layout.tsx` (or configure root layout) to ensure unauthenticated layout (no nav) is used for the login page

## 8. Build Verification

- [x] 8.1 Run `bun run build` and confirm it compiles cleanly with no TypeScript errors
