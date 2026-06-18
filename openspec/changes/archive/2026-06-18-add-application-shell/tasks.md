## 1. Install Dependencies

- [x] 1.1 Install `@tanstack/react-query` — run `bun add @tanstack/react-query`
- [x] 1.2 Create `components/QueryProvider.tsx` — a `"use client"` component that wraps children in `QueryClientProvider` with a stable `QueryClient` instance
- [x] 1.3 Add `<QueryProvider>` to the root layout (`app/layout.tsx`) so all pages have query context

## 2. Locale Strings

- [x] 2.1 Add shell-related keys to `locales/en.json`: `shell.nav.dashboard`, `shell.nav.templates`, `shell.nav.settings`, `shell.header.logout`, `shell.header.loadingUser`
- [x] 2.2 Add stub page heading keys: `dashboard.title`, `templates.title`, `settings.title`

## 3. Session Hook

- [x] 3.1 Create `features/shell/hooks/useSession.ts` — uses `useQuery` to fetch `GET /api/auth/get-session` and returns `{ user, isLoading }` typed against better-auth's session shape

## 4. Shell Components

- [x] 4.1 Create `features/shell/components/AppNav.tsx` — `"use client"` component rendering nav links using `usePathname()` to compute active state; uses shadcn `Button` (variant `ghost`) or similar primitive; link labels via `t()`
- [x] 4.2 Create `features/shell/components/AppSidebar.tsx` — server-compatible wrapper that renders the app name/logo at the top and `<AppNav>` below; no interactivity of its own
- [x] 4.3 Create `features/shell/components/AppHeader.tsx` — `"use client"` component; calls `useSession()` and shows user name/email with a skeleton fallback; includes logout button that calls `authClient.signOut()` then `router.push("/login")`; logout button is disabled while session is loading

## 5. Authenticated Route Group

- [x] 5.1 Create `app/(authenticated)/layout.tsx` — Server Component that renders a full-height flex row: `<AppSidebar>` (fixed width) + `<main>` (flex-grow, overflow-y-auto); includes `<AppHeader>` at the top of the main column
- [x] 5.2 Replace `app/page.tsx` with a `permanentRedirect("/dashboard")` call so root `/` redirects to dashboard

## 6. Stub Pages

- [x] 6.1 Create `app/(authenticated)/dashboard/page.tsx` — thin shell rendering a `<DashboardPage>` feature component
- [x] 6.2 Create `features/shell/pages/DashboardPage.tsx` — renders an `<h1>` with `t("dashboard.title")`
- [x] 6.3 Create `app/(authenticated)/templates/page.tsx` — thin shell rendering a `<TemplatesPage>` stub
- [x] 6.4 Create `features/shell/pages/TemplatesPage.tsx` — renders an `<h1>` with `t("templates.title")`
- [x] 6.5 Create `app/(authenticated)/settings/page.tsx` — thin shell rendering a `<SettingsPage>` stub
- [x] 6.6 Create `features/shell/pages/SettingsPage.tsx` — renders an `<h1>` with `t("settings.title")`

## 7. Verify

- [x] 7.1 Run `bun run build` and confirm no TypeScript errors
- [x] 7.2 Start dev server and confirm: login → redirect to `/dashboard`, shell visible with sidebar and header, nav links work, logout returns to `/login`
