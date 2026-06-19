# Design: add-test-email-sending

## Goals

- One-click "Send Test" button in the template editor sends the current template to the logged-in user's own email address
- Sample Handlebars data already in the editor is used for variable substitution
- A server-side rate limit of 100 test emails per user per 24-hour rolling window prevents abuse
- No new external dependencies; reuses the existing `lib/email` delivery service

## Non-Goals

- Sending to arbitrary addresses
- Admin override of rate limits
- Storing send history for user review

---

## Database

### New table: `test_email_sends`

Tracks per-user daily usage. One row per send event.

```ts
// db/schema/testEmailSends.ts
export const testEmailSends = pgTable("test_email_sends", {
  id: text("id").$defaultFn(() => generateId()).primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  templateId: text("template_id").notNull().references(() => templates.id, { onDelete: "cascade" }),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
});
```

Rate-limit check: `COUNT(*) WHERE userId = ? AND sentAt >= NOW() - INTERVAL '1 day'`.

No index is strictly required at this scale; add one on `(user_id, sent_at)` to avoid a full table scan as the table grows.

---

## API

### `POST /api/templates/:id/test-send`

Mounted on the existing `templatesRouter`.

**Auth**: authenticated session required (401 if not).

**Authorization**: user must be owner or collaborator of the template (same check as PATCH).

**Request body**:
```ts
interface TestSendInput {
  sampleData?: Record<string, unknown>; // Handlebars variable overrides; defaults to {}
}
```

**Rate limit check**: count rows in `test_email_sends` for the user in the last 24 hours. If ≥ 100, return 429 with `{ error: "rate_limit_exceeded", limit: 100, resetAt: <ISO timestamp 24h from oldest send> }`.

**On success**:
1. Call `sendEmail` from `lib/email` with the template's stored `mjml`, `sampleData`, and `defaults` derived from the template record (`subject`, `fromName`, `replyTo`, `preheader`). The `fromAddress` comes from `FROM_ADDRESS` in `lib/constants.ts`.
2. Insert a row into `test_email_sends`.
3. Return `{ ok: true, messageId: string }` with HTTP 200.

**On delivery failure**: return `{ ok: false, code: string, message: string }` with HTTP 502.

**Response shapes**:
```ts
// 200 success
{ ok: true; messageId: string }

// 429 rate limit
{ error: "rate_limit_exceeded"; limit: 100; resetAt: string }

// 502 delivery failure (provider error)
{ ok: false; code: string; message: string }
```

---

## New constant

```ts
// lib/constants.ts (add)
export const FROM_ADDRESS = process.env.FROM_ADDRESS;
```

The `from` field passed to Resend must be a verified sender address. This is already required by the delivery service; surfacing it as a constant makes it configurable per environment.

---

## Client: hook

```ts
// features/templates/hooks/useSendTestEmail.ts
export function useSendTestEmail(templateId: string) {
  return useMutation({
    mutationFn: (sampleData: Record<string, unknown>) =>
      fetch(`/api/templates/${templateId}/test-send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sampleData }),
      }).then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? json.message ?? "Unknown error");
        return json;
      }),
  });
}
```

No query invalidation needed (no cached list is affected by a test send).

---

## Client: UI

A "Send Test" button is added to the template editor header, between the Share button and the Save button.

**States**:
- Default: `<Button variant="outline" size="sm">Send Test</Button>`
- Loading: disabled + `<Spinner>` icon
- Success: `toast.success(t("templateEditor.testSend.success"))`
- Rate limited (429): `toast.error(t("templateEditor.testSend.rateLimitError"))`
- Delivery failure (502 / `ok: false`): `toast.error(t("templateEditor.testSend.deliveryError"))`

The button passes the current `sampleData` string parsed as JSON (or `{}` if empty/invalid) as the request body.

---

## i18n

```json
// locales/en.json additions under "templateEditor"
"testSend": {
  "button": "Send Test",
  "sending": "Sending...",
  "success": "Test email sent to your inbox.",
  "rateLimitError": "Daily limit reached (100 test emails). Try again tomorrow.",
  "deliveryError": "Failed to deliver the test email. Check your email settings."
}
```
