## Context

Post-login, the app renders a blank `app/page.tsx`. There is no persistent layout — no navigation, no user context, no way to reach any section. The auth layer (better-auth + SSO) is wired and working; sessions exist in the database. This change builds the UI shell that authenticated users land in.

Current file structure of relevance:
- `app/layout.tsx` — root layout (fonts, dark mode, body shell)
- `app/page.tsx` — blank home page (currently shown after login)
- `app/login/page.tsx` → `features/auth/pages/LoginPage.tsx`
- `features/auth/` — only auth feature domain exists so far

## Goals / Non-Goals

**Goals:**
- Route group `app/(authenticated)/` with a nested layout wrapping sidebar + header + main content
- Sidebar with links to Dashboard, Templates, Settings
- Header showing logged-in user name/email and a logout button
- Logout wired to better-auth's `authClient.signOut()`, redirecting to `/login`
- Stub pages at `/dashboard`, `/templates`, `/settings`
- Root `/` redirects to `/dashboard`

**Non-Goals:**
- Collapsible/mobile sidebar
- Active user settings or profile edit
- Any real content for stub pages

## Decisions

### 1. Route group `app/(authenticated)/layout.tsx` for the shell

**Decision:** All authenticated pages live under `app/(authenticated)/` with their own nested layout.

**Rationale:** The root layout (`app/layout.tsx`) already sets fonts and dark-mode and must also wrap the unauthenticated `/login` page. A route group isolates the shell layout to authenticated routes only, keeping the root layout clean. The existing middleware already guards all non-`/login` paths, so no additional auth check is needed inside the layout itself.

**Alternative considered:** A single root layout with conditional sidebar rendering based on pathname. Rejected — pathname checks in RSC are fragile and break the separation of public/authenticated surfaces.

### 2. Session data fetched client-side via TanStack Query

**Decision:** The `AppHeader` is a Client Component that calls `GET /api/auth/get-session` via TanStack Query to display the user's name/email.

**Rationale:** better-auth's session is already accessible at `GET /api/auth/get-session` (defined in `sso-auth` spec). Fetching it client-side keeps the layout a Server Component and makes the session data available for interactive elements (logout button). No new API endpoint needed.

**Alternative considered:** Reading the session in an RSC via `auth.api.getSession()` and passing it as a prop. Viable, but requires the layout to be async and either blocks navigation or requires streaming. Client fetch with TanStack Query gives us loading state handling for free and fits the project's data-fetching convention.

### 3. Logout via `authClient.signOut()`

**Decision:** The logout button calls better-auth's browser client `authClient.signOut()` and then calls Next.js `router.push("/login")`.

**Rationale:** better-auth's `signOut` already POSTs to `/api/auth/sign-out`, revokes the SSO refresh token, and destroys the local session — exactly the behaviour specified in `sso-auth`. No new Hono route is needed.

### 4. `app/shell/` feature domain

**Decision:** Shell components live in `features/shell/` — `AppSidebar`, `AppHeader`, `AppNav`, and a `useSession` hook.

**Rationale:** Follows the project's `features/<domain>/` convention for business-logic-bearing components. Generic reusable primitives stay in `components/`; the shell is domain-specific to the authenticated app context.

### 5. Root `/` redirects to `/dashboard`

**Decision:** `app/page.tsx` becomes a redirect (`permanentRedirect("/dashboard")`).

**Rationale:** There is no meaningful home page distinct from the dashboard. A redirect is the simplest correct behaviour and avoids a blank screen.

## Risks / Trade-offs

- **Session flash on header load** → The header may briefly show a loading skeleton before the session resolves. Mitigated with a skeleton placeholder that matches the header height.
- **Stub pages feel empty** → Acceptable; each will be filled by a subsequent change. A minimal "Coming soon" label suffices and won't be user-facing in production yet.
- **`authClient` bundle size** → better-auth's browser client is already imported by the login page, so no net addition.

## Migration Plan

1. Create `app/(authenticated)/layout.tsx` and move `app/page.tsx` to `app/(authenticated)/page.tsx` (as a redirect)
2. Add stub pages under `app/(authenticated)/dashboard/page.tsx`, `templates/page.tsx`, `settings/page.tsx`
3. Build `features/shell/` components and hook
4. Update `locales/en.json` with new string keys
5. No database changes, no migrations needed
