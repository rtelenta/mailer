## 1. Move email service

- [x] 1.1 Create `features/email/` and move `lib/email/types.ts` → `features/email/types.ts` (no internal imports to fix)
- [x] 1.2 Move `lib/email/renderer.ts` → `features/email/renderer.ts` (no internal imports to fix)
- [x] 1.3 Move `lib/email/resend.ts` → `features/email/resend.ts`, fix import of `types.ts` to `./types`
- [x] 1.4 Move `lib/email/index.ts` → `features/email/index.ts`, fix imports of `./renderer` and `./resend` and `./types`

## 2. Move usage tracking

- [x] 2.1 Create `features/usage/` and move `lib/usage/events.ts` → `features/usage/events.ts` (imports only from `@/db`, no changes needed)

## 3. Move dashboard DB query

- [x] 3.1 Move `lib/db/dashboard.ts` → `features/dashboard/db.ts` (imports only from `@/db`, no changes needed)

## 4. Move templates API router

- [x] 4.1 Create `features/templates/api.ts` by merging `lib/api/templates.ts` and `lib/api/templateShares.ts` — fix imports of `@/lib/email` → `@/features/email`, `@/lib/usage/events` → `@/features/usage/events`

## 5. Move account API router

- [x] 5.1 Create `features/account/api.ts` by moving `lib/api/tokens.ts` — imports from `@/lib/auth`, `@/db`, `@/db/schema/apiTokens` only; no path changes needed

## 6. Move dashboard API router

- [x] 6.1 Create `features/dashboard/api.ts` by moving `lib/api/dashboard.ts` — fix import of `@/lib/db/dashboard` → `@/features/dashboard/db`

## 7. Move public send API router

- [x] 7.1 Create `features/send/` and create `features/send/api.ts` by moving `lib/api/v1.ts` — fix imports of `@/lib/email` → `@/features/email`, `@/lib/usage/events` → `@/features/usage/events`

## 8. Update lib/api/index.ts

- [x] 8.1 Update `lib/api/index.ts` import paths: `@/lib/api/templates` → `@/features/templates/api`, `@/lib/api/tokens` → `@/features/account/api`, `@/lib/api/v1` → `@/features/send/api`, `@/lib/api/dashboard` → `@/features/dashboard/api`

## 9. Fix remaining import references

- [x] 9.1 Search for any file still importing from `@/lib/email`, `@/lib/usage/events`, `@/lib/db/dashboard` and update each to the new feature paths

## 10. Delete vacated files

- [x] 10.1 Delete `lib/api/templates.ts`, `lib/api/templateShares.ts`, `lib/api/tokens.ts`, `lib/api/dashboard.ts`, `lib/api/v1.ts`
- [x] 10.2 Delete `lib/email/` directory
- [x] 10.3 Delete `lib/usage/events.ts` and the now-empty `lib/usage/` directory
- [x] 10.4 Delete `lib/db/dashboard.ts` and the now-empty `lib/db/` directory

## 11. Verify

- [x] 11.1 Run `bun tsc --noEmit` and confirm zero TypeScript errors
