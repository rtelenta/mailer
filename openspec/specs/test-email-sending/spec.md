# test-email-sending

Send a compiled, Handlebars-rendered test email from a template to the authenticated user's own email address, with a daily rate limit.

## Functional Requirements

### FR-1: Send Test Email
- `POST /api/templates/:id/test-send` MUST send the template to the authenticated user's own email address
- The request body MAY include `sampleData: Record<string, unknown>`; if omitted or empty it defaults to `{}`
- The system MUST compile the template's `mjml` field and apply `sampleData` as Handlebars variables before sending
- Template defaults (`subject`, `fromName`, `replyTo`, `preheader`) MUST be taken from the stored template record
- The `from` address MUST be taken from `FROM_ADDRESS` in `lib/constants.ts`
- The recipient address MUST be the authenticated user's email from their better-auth session — the caller MUST NOT supply a recipient

### FR-2: Authorization
- The endpoint MUST require an authenticated better-auth session (401 if not)
- The authenticated user MUST be the owner or a collaborator of the template (same access rule as `PATCH /api/templates/:id`); return 403 otherwise

### FR-3: Rate Limiting
- The system MUST enforce a hard cap of 100 test emails per user per rolling 24-hour window
- When the limit is exceeded the endpoint MUST return HTTP 429 with `{ error: "rate_limit_exceeded", limit: 100, resetAt: <ISO 8601> }` where `resetAt` is 24 hours after the oldest send in the current window
- Sends that fail delivery (FR-4) MUST still be recorded against the limit

### FR-4: Delivery Result
- On successful delivery the endpoint MUST return HTTP 200 with `{ ok: true, messageId: string }`
- On provider delivery failure the endpoint MUST return HTTP 502 with `{ ok: false, code: string, message: string }`

## Interface Contract

### API Endpoint

```
POST /api/templates/:id/test-send
```

### Request body

```ts
interface TestSendInput {
  sampleData?: Record<string, unknown>;
}
```

### Response shapes

```ts
// 200 — delivery succeeded
{ ok: true; messageId: string }

// 429 — rate limit exceeded
{ error: "rate_limit_exceeded"; limit: 100; resetAt: string }

// 502 — provider delivery failure
{ ok: false; code: string; message: string }
```

## Database

### `test_email_sends` table

Tracks individual test send events for rate-limit enforcement.

```ts
interface TestEmailSendRow {
  id: string;
  userId: string;       // FK → user.id (CASCADE DELETE)
  templateId: string;   // FK → templates.id (CASCADE DELETE)
  sentAt: Date;
}
```

Index: `(user_id, sent_at)` for efficient rolling-window count queries.

## Non-Functional Requirements

- The handler is server-side only; no Drizzle imports in Client Components
- `userId` and the recipient email MUST be read from the session server-side — they MUST NOT be passed in the request body
- `FROM_ADDRESS` MUST be exported from `lib/constants.ts`
- All rate-limit and delivery logic MUST reside in the API handler (`lib/api/templates.ts`)
