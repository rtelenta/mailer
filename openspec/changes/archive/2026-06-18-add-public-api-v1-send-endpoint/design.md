# Design: add-public-api-v1-send-endpoint

## Goals

- Expose `POST /api/v1/send` as the stable public surface external services call to trigger email delivery
- Authenticate exclusively via Bearer API token using the existing `getRequestUserId` utility
- Look up a template by `name` scoped to the authenticated user's account, render it, and deliver it
- Support a single or multiple recipient addresses in `to`
- Allow per-send overrides for `subject`, `fromName`, `replyTo`, `preheader` to complement template defaults

## Non-Goals

- CC / BCC, attachments, scheduling
- Template lookup by ID or across accounts
- Per-token rate limiting

---

## Routing

A new Hono sub-router `v1Router` is added at `lib/api/v1.ts` and mounted in `lib/api/index.ts` at path `/v1`:

```ts
// lib/api/index.ts (addition)
import { v1Router } from "@/lib/api/v1";
app.route("/v1", v1Router);
```

The route is `POST /send` inside the `v1Router`, making the full path `POST /api/v1/send`. The `/v1` prefix isolates all future v1 public API routes.

---

## Request & Response Contract

### POST /api/v1/send

**Request body** (JSON):

```ts
interface SendRequest {
  templateName: string;               // name of template owned by the authenticated user
  to: string | string[];              // one or more recipient email addresses
  content?: Record<string, unknown>;  // Handlebars variable values (default: {})
  subject?: string;                   // overrides template subject
  fromName?: string;                  // overrides template fromName
  replyTo?: string;                   // overrides template replyTo
  preheader?: string;                 // overrides template preheader
}
```

**Responses:**

| Status | Condition | Body |
|--------|-----------|------|
| 200 | Email delivered | `{ ok: true, messageId: string }` |
| 400 | Delivery failed (provider error) | `{ ok: false, code: string, message: string }` |
| 401 | Missing or invalid Bearer token | `{ error: "Unauthorized" }` |
| 404 | No template with that name found for this user | `{ error: "Template not found" }` |
| 422 | Zod validation failure | `{ error: "Validation failed", issues: [...] }` |

---

## Zod Schema

```ts
const sendSchema = z.object({
  templateName: z.string().min(1),
  to: z.union([z.string().email(), z.array(z.string().email()).min(1)]),
  content: z.record(z.unknown()).optional().default({}),
  subject: z.string().min(1).optional(),
  fromName: z.string().min(1).optional(),
  replyTo: z.string().email().optional(),
  preheader: z.string().optional(),
});
```

---

## Handler Logic

```
1. getRequestUserId(c.req.raw)          → 401 if null
2. parse + validate body with Zod       → 422 on failure
3. db.select from templates
     where userId = userId
       AND name  = templateName
     limit 1                            → 404 if no row
4. build SendEmailParams:
     mjml     = row.mjml
     content  = parsed.content
     defaults = { subject, fromName, fromAddress, replyTo, preheader }
                  where defaults come from the template row
     overrides = { subject?, fromName?, replyTo?, preheader? }
                  from request body (only fields that were supplied)
5. normalize `to` to string[]
6. call sendEmail(params)               (lib/email/index.ts)
7. if result.ok     → 200 { ok: true, messageId }
   if !result.ok    → 400 { ok: false, code, message }
```

`RESEND_FROM_ADDRESS` (or equivalent) is already in `lib/constants.ts`; the handler reads it from there for `defaults.fromAddress`.

---

## File Structure

```
lib/api/v1.ts          ← new Hono sub-router (POST /send)
lib/api/index.ts       ← add: import + app.route("/v1", v1Router)
```

No new DB tables, no migrations. No UI changes. No new i18n keys.

---

## Error Handling

- Zod parse failures surface all issues (`.error.issues`) in the 422 body.
- Template not found: 404 — does not reveal whether the name exists under a different account.
- Provider delivery failure: `sendEmail` already returns `{ ok: false, code, message }`; the handler maps this to HTTP 400 (client gets actionable error detail without a 5xx alarm).
- Unexpected thrown errors: let Hono's default error handler convert to 500; no custom wrapping needed.
