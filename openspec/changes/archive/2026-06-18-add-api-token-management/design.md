# Design: Add API Token Management

## Goals

- Let users create named API tokens that can authenticate programmatic API calls
- Store only a hash of the token; show plaintext exactly once (at creation time)
- Display last-used-at on each token row so users can audit activity
- Revoke tokens individually from the account settings page

## Non-Goals

- Token scopes or permissions
- Token expiry / rotation
- Rate limiting per token
- Programmatic API consumption endpoints (those are a separate capability)

---

## Database

### New table: `api_tokens`

```ts
// db/schema/apiTokens.ts
export const apiTokens = pgTable("api_tokens", {
  id:           text("id").$defaultFn(() => generateId()).primaryKey(),
  userId:       text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  name:         text("name").notNull(),
  tokenHash:    text("token_hash").notNull().unique(),
  tokenPrefix:  text("token_prefix").notNull(),   // first 8 chars of the raw token, shown in the list
  lastUsedAt:   timestamp("last_used_at"),         // null until first use
  createdAt:    timestamp("created_at").notNull().defaultNow(),
});
```

Index: `(user_id)` for listing a user's tokens.

### Token format

- Generate 32 random bytes → hex string (64 chars)
- Store first 8 characters as `tokenPrefix` for display
- Hash the full token with SHA-256 (Node `crypto.createHash('sha256')`) → store as hex in `tokenHash`
- Return the raw token to the client once; it is never stored or recoverable after that

---

## API Layer

New Hono sub-router: `lib/api/tokens.ts`, mounted at `/` in `lib/api/index.ts`.

### `GET /api/tokens`

Returns all tokens for the authenticated user (never the hash).

Response:
```ts
{ tokens: ApiTokenRecord[] }
// ApiTokenRecord: { id, name, tokenPrefix, lastUsedAt: string|null, createdAt: string }
```

### `POST /api/tokens`

Creates a new token.

Request body: `{ name: string }` (min 1, max 255)

On success returns `201`:
```ts
{ token: ApiTokenRecord & { plaintext: string } }
```

The `plaintext` field is the raw token — this is the only response that includes it.

### `DELETE /api/tokens/:id`

Revokes (deletes) a token. Only the owning user can revoke their own tokens.

Returns `204` on success, `404` if not found, `403` if not the owner.

### Authentication middleware

A Hono middleware added to the `/api/*` chain checks for a `Bearer` token before falling through to the session-based handler:

```
Authorization: Bearer <raw-token>
```

If present:
1. Hash the raw value with SHA-256
2. Look up the hash in `api_tokens`
3. If found, attach a synthetic `userId` to the context and update `lastUsedAt` asynchronously (fire-and-forget)
4. If not found, return `401`

The middleware runs only when an `Authorization: Bearer` header is present. Requests without it fall through to the existing session-based auth (SSO cookie). This means session auth and token auth coexist transparently.

The middleware is applied broadly to `app` in `lib/api/index.ts`, before route handlers.

---

## UI

### Placement

Replace the "coming soon" stub in `AccountSettingsPage.tsx` with a new `ApiTokensSection` component (`features/account/components/ApiTokensSection.tsx`).

### `ApiTokensSection` layout

1. **Token list** (top) — a table or stacked list; each row shows:
   - Token name
   - Prefix (e.g. `a1b2c3d4…`)
   - Last used: either a formatted date or "Never"
   - Revoke button (destructive outline or ghost variant)

2. **Create form** (below the list) — a single `Input` for the token name + a "Create Token" `Button`.
   - Submits on button click or Enter
   - The input clears on success

3. **Reveal dialog** — shown once after successful creation. Contains:
   - Instructional text (copy once, cannot be shown again)
   - The plaintext token in a monospace `<code>` block
   - A "Copy" button (uses `navigator.clipboard.writeText`)
   - A "Done" button to dismiss

### Hooks

- `useApiTokens()` — `useQuery` fetching `GET /api/tokens`
- `useCreateApiToken()` — `useMutation` posting `POST /api/tokens`; on success invalidates the tokens query
- `useRevokeApiToken()` — `useMutation` posting `DELETE /api/tokens/:id`; on success invalidates the tokens query

---

## i18n

All new strings go under `account.apiTokens` in `locales/en.json`.

---

## Migration

Generate via `bunx drizzle-kit generate`. Additive — creates `api_tokens` table and index.

---

## File Checklist

| File | Action |
|------|--------|
| `db/schema/apiTokens.ts` | Create |
| `db/migrations/XXXX_add_api_tokens.sql` | Generate |
| `lib/api/tokens.ts` | Create |
| `lib/api/index.ts` | Modify — mount tokensRouter, add Bearer middleware |
| `features/account/components/ApiTokensSection.tsx` | Create |
| `features/account/hooks/useApiTokens.ts` | Create |
| `features/account/hooks/useCreateApiToken.ts` | Create |
| `features/account/hooks/useRevokeApiToken.ts` | Create |
| `features/account/pages/AccountSettingsPage.tsx` | Modify — replace stub with ApiTokensSection |
| `locales/en.json` | Modify — add apiTokens keys |
