# api-token-management

Personal API tokens allowing programmatic access to the mailer API. Tokens are all-or-nothing (no scopes), stored hashed, and displayed with a last-used-at timestamp.

---

## Functional Requirements

### FR-1: Token Creation

Users MUST be able to create a named API token from the account settings page.

The creation request MUST include a `name` field (min 1 char, max 255 chars).

On creation the system MUST:
1. Generate a 32-byte cryptographically random token, hex-encoded (64 characters)
2. Store the first 8 characters as `tokenPrefix`
3. Store the SHA-256 hash of the full token as `tokenHash`
4. Return the plaintext token in the API response exactly once

The plaintext token MUST NOT be stored or retrievable after the creation response.

### FR-2: Token Listing

Users MUST be able to list all their active API tokens.

The list response MUST include for each token: `id`, `name`, `tokenPrefix`, `lastUsedAt` (ISO 8601 or `null`), `createdAt` (ISO 8601).

The list response MUST NOT include `tokenHash` or the plaintext token.

### FR-3: Token Revocation

Users MUST be able to revoke any of their own tokens individually.

Revoking a token MUST delete it from the database immediately.

A revoked token MUST no longer authenticate API requests.

### FR-4: Bearer Token Authentication

API requests MUST be authenticatable via an `Authorization: Bearer <token>` header as an alternative to SSO session cookies.

When a `Bearer` token is present, the system MUST:
1. Hash the provided value with SHA-256
2. Look up the hash in the `api_tokens` table
3. If found, treat the request as authenticated by the owning user
4. Update `lastUsedAt` on the token (asynchronously — MUST NOT block the response)
5. If not found, return `401`

Requests without an `Authorization: Bearer` header MUST fall through to the existing session-based auth.

### FR-5: Token Reveal (UI)

After successful token creation the UI MUST display the plaintext token in a modal dialog.

The dialog MUST:
- Include instructional text explaining the token will not be shown again
- Show the token in a monospace code block
- Provide a "Copy" button that writes the token to the clipboard
- Remain dismissable with a "Done" button

After the dialog is dismissed, the plaintext token MUST be cleared from client-side state.

---

## API Requirements

### AR-1: GET /api/tokens

Returns the authenticated user's tokens.

- `401` if unauthenticated
- `200` with `{ tokens: ApiTokenRecord[] }`

### AR-2: POST /api/tokens

Creates a new token.

- `401` if unauthenticated
- `422` on validation failure (`name` missing or out of bounds)
- `201` with `{ token: ApiTokenRecord & { plaintext: string } }`

### AR-3: DELETE /api/tokens/:id

Revokes a token.

- `401` if unauthenticated
- `404` if not found or belongs to a different user
- `204` on success

---

## Interface Contracts

### ApiTokenRecord

```typescript
interface ApiTokenRecord {
  id: string;
  name: string;
  tokenPrefix: string;   // first 8 chars of the raw token (display only)
  lastUsedAt: string | null;  // ISO 8601
  createdAt: string;           // ISO 8601
}
```

### POST /api/tokens request body

```typescript
interface CreateTokenInput {
  name: string;  // min 1, max 255
}
```

---

## Database

### `api_tokens` table

```typescript
interface ApiTokenRow {
  id: string;
  userId: string;       // FK → user.id (CASCADE DELETE)
  name: string;
  tokenHash: string;    // SHA-256 hex of the raw token, unique
  tokenPrefix: string;  // first 8 chars of the raw token
  lastUsedAt: Date | null;
  createdAt: Date;
}
```

Index: `(user_id)` for listing a user's tokens.

---

## Non-Functional Requirements

- `tokenHash` MUST use SHA-256; no bcrypt (tokens are already high-entropy)
- `tokenHash` MUST have a unique index to prevent hash collisions from granting access
- Bearer middleware MUST run before route handlers and MUST NOT be session-dependent
- `lastUsedAt` updates MUST be fire-and-forget (no await in the request path)
- All token management logic MUST reside server-side; client receives only `ApiTokenRecord` + one-time plaintext
