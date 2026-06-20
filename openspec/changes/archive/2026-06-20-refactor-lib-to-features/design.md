## Context

The `lib/` folder currently mixes two categories of code:

**Infrastructure (should stay in `lib/`):**
- `lib/auth.ts` — Better Auth configuration
- `lib/auth-client.ts` — Better Auth browser client
- `lib/constants.ts` — env var re-exports (required here by project convention)
- `lib/utils.ts` — generic Tailwind `cn()` utility
- `lib/api/index.ts` — Hono app wiring (imports routers from features, keeps `basePath`)
- `lib/api/auth.ts` — auth handler wiring

**Business logic (must move to `features/`):**
- `lib/api/templates.ts` + `lib/api/templateShares.ts` — template CRUD and sharing domain logic
- `lib/api/tokens.ts` — API token management domain logic
- `lib/api/dashboard.ts` — dashboard stats API handler
- `lib/db/dashboard.ts` — `getDashboardStats` DB query (belongs with dashboard domain)
- `lib/api/v1.ts` — public send API handler
- `lib/email/` — MJML compile + Handlebars render + Resend delivery (email service)
- `lib/usage/events.ts` — usage event tracking

## Goals / Non-Goals

**Goals:**
- All business logic under `features/<domain>/`
- `lib/` contains only infrastructure, config, and generic utilities
- No behavior changes — this is a mechanical file move with import path updates

**Non-Goals:**
- Restructuring within each feature (e.g., splitting a file into sub-modules)
- Changing function signatures or exported types
- Adding new features or fixing bugs

## Decisions

### 1. New feature placement

| From | To | Reason |
|------|----|--------|
| `lib/api/templates.ts` + `lib/api/templateShares.ts` | `features/templates/api.ts` | Template feature already exists |
| `lib/api/tokens.ts` | `features/account/api.ts` | Account feature already exists; tokens are account-level |
| `lib/api/dashboard.ts` | `features/dashboard/api.ts` | Dashboard feature already exists |
| `lib/db/dashboard.ts` | `features/dashboard/db.ts` | DB query is dashboard domain logic |
| `lib/api/v1.ts` | `features/send/api.ts` | New `send` domain — public send API is distinct from template management |
| `lib/email/` | `features/email/` | Email service is business logic (MJML + Handlebars + provider); new `email` domain |
| `lib/usage/events.ts` | `features/usage/events.ts` | Usage tracking is business logic; new `usage` domain |

### 2. `lib/api/index.ts` stays

The Hono app entry point (`app = new Hono().basePath("/api")`) is orchestration/wiring, not business logic. It stays at `lib/api/index.ts` but its imports update to reference the new feature paths.

### 3. Merge templates routers into one file

`lib/api/templates.ts` and `lib/api/templateShares.ts` both belong to the templates domain and are already mounted together in `index.ts`. They merge into `features/templates/api.ts` to avoid two tiny files.

## Risks / Trade-offs

- [Wide import churn] Every file that imports from `lib/api/*`, `lib/email/*`, `lib/usage/*`, or `lib/db/dashboard` needs an import path update → Mitigation: move one domain at a time; TypeScript compiler errors surface every broken import immediately.
- [New `send`, `email`, `usage` feature folders] These are new domains with no existing components → Mitigation: `features/<domain>/` can start with just a single file; the folder structure is additive.

## Migration Plan

1. Create `features/templates/api.ts` — move + merge templates and templateShares routers
2. Create `features/account/api.ts` — move tokens router
3. Create `features/dashboard/api.ts` — move dashboard router
4. Create `features/dashboard/db.ts` — move `getDashboardStats`
5. Create `features/send/api.ts` — move v1 router
6. Create `features/email/` — move `index.ts`, `renderer.ts`, `types.ts`, `resend.ts`
7. Create `features/usage/events.ts` — move `trackEvent`
8. Update `lib/api/index.ts` — fix all import paths to reference new feature locations
9. Update any other files importing from moved paths (TypeScript will flag them)
10. Delete the vacated files from `lib/`

No DB migrations, no env var changes, no API contract changes. Rollback = revert the commit.
