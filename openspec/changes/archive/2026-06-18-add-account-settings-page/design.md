## Context

The `/settings` route currently renders a one-line stub (`<h1>Settings</h1>`). This change replaces it with a real account settings layout that shows the user's SSO-sourced profile and establishes the structural container for future subsections (API tokens, etc.).

Session data is already available via the existing `useSession()` hook in `features/shell/hooks/useSession.ts`, which fetches `GET /api/auth/get-session` and caches the result in TanStack Query.

## Goals / Non-Goals

**Goals:**
- Replace the Settings stub with a real, production-quality page
- Display read-only SSO profile info (name, email, initials avatar)
- Create a stable layout container that new subsections can be appended to without restructuring

**Non-Goals:**
- Profile editing (SSO is the source of truth)
- API token CRUD (next change)
- Tabs — unnecessary complexity until more than one real section exists

## Decisions

### D1: New `features/account/` domain, not `features/shell/`

The current `SettingsPage` stub lives in `features/shell/pages/` because it was scaffolded as part of the shell change. Account settings is business logic (profile display, future preferences, API tokens) — it belongs in its own domain. The stub in `features/shell/pages/SettingsPage.tsx` is replaced by `features/account/pages/AccountSettingsPage.tsx`.

`app/(authenticated)/settings/page.tsx` simply swaps the import. No routing changes.

**Alternative considered**: Keep it in `features/shell/`. Rejected — shell should contain only layout infrastructure, not domain pages.

### D2: Reuse `useSession()` rather than adding a new hook

The header already fetches and caches the session. Calling `useSession()` from `AccountSettingsPage` hits the same TanStack Query cache key (`["session"]`) — no extra network round-trip.

**Alternative considered**: Add a dedicated `/api/account/profile` endpoint. Rejected — the SSO session object already carries all the profile data we need for this change, and adding an endpoint would be premature.

### D3: Vertical section layout, not tabs

With only one real section (Account) and one stub (API Tokens), tabs would feel empty and misleading. A vertical section layout with a divider reads naturally and composes cleanly when the API Tokens section fills in.

### D4: Initials avatar, not image

The SSO session object includes `name` and `email` but not a guaranteed avatar URL. An initials-based avatar (first character of name or email, rendered in a colored circle) avoids a broken `<img>` and doesn't require any SSO schema assumptions.

## Risks / Trade-offs

- **SSO session shape assumption** → The `useSession` hook types the response as `typeof auth.$Infer.Session`. If the SSO adds or renames fields the types stay safe (TypeScript strict mode). No mitigation needed beyond the existing types.
- **Stub API Tokens section** → Shows a placeholder until the next change. Risk: users see an incomplete section. Mitigation: label it clearly or omit the section heading until the feature lands. Decision: include a minimal "API Tokens" label with a "Coming soon" indicator so the nav container is real but the section is not confusing.

## Migration Plan

1. Delete `features/shell/pages/SettingsPage.tsx`
2. Create `features/account/pages/AccountSettingsPage.tsx`
3. Update `app/(authenticated)/settings/page.tsx` to import from the new path
4. Add locales for new strings
5. No DB migrations, no API route changes, no env var changes
