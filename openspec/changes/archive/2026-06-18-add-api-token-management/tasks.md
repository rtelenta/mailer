## 1. Database

- [x] 1.1 Create `db/schema/apiTokens.ts` — `api_tokens` table with `id`, `userId` (FK → user cascade delete), `name`, `tokenHash` (unique), `tokenPrefix`, `lastUsedAt` (nullable timestamp), `createdAt`; add index on `(user_id)`
- [x] 1.2 Export `apiTokens` from the schema barrel (add to `db/schema/index.ts` if it exists, otherwise import directly where needed)
- [x] 1.3 Run `bunx drizzle-kit generate` to produce the migration SQL

## 2. API — Token Endpoints

- [x] 2.1 Create `lib/api/tokens.ts` — Hono sub-router with `GET /tokens`, `POST /tokens`, `DELETE /tokens/:id`; use `crypto.createHash('sha256')` for hashing and `crypto.randomBytes(32).toString('hex')` for generation; auth via `auth.api.getSession`
- [x] 2.2 Mount `tokensRouter` in `lib/api/index.ts` (`app.route("/", tokensRouter)`)

## 3. API — Bearer Token Middleware

- [x] 3.1 Add a Hono middleware in `lib/api/index.ts` (before route handlers) that intercepts `Authorization: Bearer <token>` headers, hashes the value, looks up `api_tokens`, and attaches `userId` to context; falls through if no `Bearer` header; returns `401` if hash not found
- [x] 3.2 Update `lastUsedAt` fire-and-forget inside the middleware (no `await`)

## 4. Client Hooks

- [x] 4.1 Create `features/account/hooks/useApiTokens.ts` — `useQuery` for `GET /api/tokens`
- [x] 4.2 Create `features/account/hooks/useCreateApiToken.ts` — `useMutation` for `POST /api/tokens`; on success invalidate the tokens query
- [x] 4.3 Create `features/account/hooks/useRevokeApiToken.ts` — `useMutation` for `DELETE /api/tokens/:id`; on success invalidate the tokens query

## 5. UI — ApiTokensSection Component

- [x] 5.1 Create `features/account/components/ApiTokensSection.tsx` — renders token list (name, `tokenPrefix…`, last-used-at or "Never", revoke button), inline create form (name input + "Create Token" button), and empty state
- [x] 5.2 Add the reveal dialog inside `ApiTokensSection`: shown after creation, displays plaintext token in monospace code block with a "Copy" button and "Done" dismiss button; clears plaintext on dismiss

## 6. Wire Up Settings Page

- [x] 6.1 Import `ApiTokensSection` in `features/account/pages/AccountSettingsPage.tsx` and replace the "coming soon" stub with `<ApiTokensSection />`

## 7. i18n

- [x] 7.1 Add `account.apiTokens` keys to `locales/en.json`: section heading, empty state, column headers (name, prefix, lastUsed), "Never", create form label and button, reveal dialog title/instructions/copy/done, revoke button, success/error toasts
