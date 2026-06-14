## Context

The mailer platform needs authentication before any features can be shipped. The auth model is strictly delegated: this app is an OAuth2 **client** that trusts the internal SSO as the identity provider. `better-auth` with the `@better-auth/sso` plugin handles the OAuth2 Authorization Code flow, session storage, and token lifecycle. No passwords or social OAuth are in scope.

Current state: project foundation is in place (Drizzle + Postgres, Hono at `/api/*`, constants, shadcn/ui). No auth layer exists yet.

## Goals / Non-Goals

**Goals:**
- Configure `better-auth` as an OAuth2 client pointed at the internal SSO
- Store sessions and user records in Postgres via Drizzle adapter
- Expose `/api/auth/*` handler through Hono
- Implement sign-in redirect, callback, and logout flows
- Protect all non-auth routes with session middleware

**Non-Goals:**
- Password-based or social OAuth login
- User admin or role management
- MFA or account linking

## Decisions

### 1. `better-auth` with `@better-auth/sso` plugin

`better-auth` provides the session store, Drizzle adapter, and cookie management out of the box. The `@better-auth/sso` plugin adds the OAuth2 client flow (PKCE, state, token exchange) so we don't hand-roll it. Alternative (hand-rolled fetch to SSO) would require us to implement PKCE, state validation, JWKS verification, and token refresh from scratch — too much undifferentiated risk.

**Config location:** `lib/auth.ts`

```ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { sso } from "@better-auth/sso";
import { db } from "@/db";
import { SSO_BASE_URL, SSO_CLIENT_ID, SSO_CLIENT_SECRET, BETTER_AUTH_SECRET } from "@/lib/constants";

export const auth = betterAuth({
  secret: BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "pg" }),
  plugins: [
    sso({
      issuer: SSO_BASE_URL,
      clientId: SSO_CLIENT_ID,
      clientSecret: SSO_CLIENT_SECRET,
      scope: ["openid", "email", "profile"],
    }),
  ],
});
```

### 2. Hono route handler at `/api/auth/*`

better-auth exposes a `fetch`-compatible handler. Hono's `c.req.raw` passes the native `Request` object through unchanged, and we return the `Response` directly.

```ts
// lib/api/index.ts
import { auth } from "@/lib/auth";

app.on(["GET", "POST"], "/auth/*", (c) => auth.handler(c.req.raw));
```

This keeps all API traffic under one catch-all Next.js route (`app/api/[...route]/route.ts`) and avoids a second Next.js route for auth.

**Alternative considered:** separate `app/api/auth/[...all]/route.ts` Next.js handler (better-auth's default docs pattern). Rejected because it would split the API surface — some routes handled by Hono, others by Next.js directly.

### 3. Drizzle schema for better-auth tables

better-auth requires `user`, `session`, `account`, and `verification` tables. We define them in `db/schema/auth.ts` so Drizzle Kit can generate migrations.

All PKs are UUID v7 per project convention. better-auth's Drizzle adapter accepts custom table/column names via the `schema` option.

```ts
// db/schema/auth.ts (shape)
export const user = pgTable("user", {
  id: text("id").primaryKey(),          // better-auth manages UUIDs as text
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});
// session, account, verification follow better-auth's schema contract
```

> Note: better-auth manages its own IDs as `text` (UUID strings). We keep UUID v7 via the Drizzle adapter's `generateId` override for the `user` table; session and account IDs remain better-auth-managed.

### 4. Middleware: protect all non-auth routes

A Next.js middleware file (`middleware.ts` at project root) reads the better-auth session on every request. Unauthenticated requests to any route other than `/login` and `/api/auth/*` are redirected to `/login`.

```ts
// middleware.ts
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/auth"];

export async function middleware(request: NextRequest) {
  const isPublic = PUBLIC_PATHS.some((p) => request.nextUrl.pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next|favicon.ico).*)"] };
```

### 5. UI: Login page

`/login` is a Server Component shell (`app/login/page.tsx`) rendering `features/auth/pages/LoginPage.tsx`. The page shows a single "Sign in with SSO" button that POSTs to `/api/auth/sign-in/sso` (the better-auth SSO plugin endpoint), which issues the redirect to the identity provider.

### 6. Environment constants

All new env vars are added to `lib/constants.ts`:

```ts
export const SSO_BASE_URL = process.env.SSO_BASE_URL;
export const SSO_CLIENT_ID = process.env.SSO_CLIENT_ID;
export const SSO_CLIENT_SECRET = process.env.SSO_CLIENT_SECRET;
export const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET;
export const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL;
```

`.env.local` gets development placeholders.

## Risks / Trade-offs

- **SSO not running locally** → Developers need the SSO reachable (or mocked) for the auth flow to complete. Mitigation: document dev setup; the `/login` page and middleware still work in isolation.
- **better-auth schema drift** → If better-auth adds required columns in a future version, migrations will be needed. Mitigation: pin `better-auth` version, review changelog on upgrade.
- **Cookie / domain mismatch in prod** → `BETTER_AUTH_SECRET` must be consistent across replicas; session cookies must match the domain. Mitigation: document required env vars clearly.
- **Token refresh on 401** → SSO-initiated logout causes a 401 on the next access token use. The middleware catches this and redirects to `/login`. No background refresh loop is implemented in this change (access tokens are short-lived at 15 min).
