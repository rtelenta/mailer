## Why

Business logic is scattered across `lib/api/`, `lib/email/`, `lib/usage/`, and `lib/db/`, violating the project's own architecture convention that "business logic lives in `features/<domain>/`". This makes it hard to locate domain code and blurs the boundary between infrastructure and product logic.

## What Changes

- Move `lib/api/templates.ts` + `lib/api/templateShares.ts` → `features/templates/api.ts`
- Move `lib/api/tokens.ts` → `features/account/api.ts`
- Move `lib/api/dashboard.ts` → `features/dashboard/api.ts`
- Move `lib/db/dashboard.ts` → `features/dashboard/db.ts`
- Move `lib/api/v1.ts` → `features/send/api.ts` (new `send` domain for the public send API)
- Move `lib/email/` → `features/email/` (shared email service used by templates and send)
- Move `lib/usage/events.ts` → `features/usage/events.ts`
- Keep in `lib/`: `auth.ts`, `auth-client.ts`, `constants.ts`, `utils.ts` — infrastructure/config only
- Update `lib/api/index.ts` imports to reference the new feature paths

## Non-goals

- No behavior changes — this is a pure structural refactor
- No changes to `app/api/[...route]/route.ts` or the Hono routing contract
- No changes to the public API schema or response shapes

## Capabilities

### New Capabilities
<!-- none — this is a structural refactor, no new spec-level behavior -->

### Modified Capabilities
<!-- none — no requirement changes, only file locations change -->

## Impact

- All files importing from `lib/api/*`, `lib/email/*`, `lib/usage/*`, `lib/db/dashboard` need import path updates
- No DB schema changes, no API contract changes, no env var changes
