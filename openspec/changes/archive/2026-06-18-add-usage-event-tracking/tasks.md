## 1. Database

- [x] 1.1 Create `db/schema/usageEvents.ts` with the `usage_events` table: `id`, `userId` (FK → user, CASCADE DELETE), `templateId` (FK → templates, SET NULL), `eventType` (text), `metadata` (jsonb), `createdAt`; add indexes on `(userId, createdAt)`, `(userId, eventType, createdAt)`, `(templateId, createdAt)`
- [x] 1.2 Export `usageEvents` from `db/schema/index.ts`
- [x] 1.3 Generate and apply the Drizzle migration (`bun drizzle-kit generate` + `bun drizzle-kit migrate`)

## 2. Event Helper

- [x] 2.1 Create `lib/usage/events.ts` with a `trackEvent({ userId, templateId?, eventType, metadata? })` function that inserts a row into `usage_events` and swallows all errors (try/catch, never re-throws)

## 3. Instrumentation

- [x] 3.1 In `lib/api/templates.ts` test-send handler: call `trackEvent` with `test_send_ok` on success (pass `messageId` in metadata) and `test_send_error` on provider failure (pass `code` + `message` in metadata)
- [x] 3.2 In `lib/api/v1.ts` send handler: call `trackEvent` with `api_send_ok` on success and `api_send_error` on provider failure

## 4. Verification

- [x] 4.1 Run `bun run tsc --noEmit` — zero type errors
