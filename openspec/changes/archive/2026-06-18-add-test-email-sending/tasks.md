## 1. Database

- [x] 1.1 Create `db/schema/testEmailSends.ts` with the `test_email_sends` table (id, userId → user.id CASCADE, templateId → templates.id CASCADE, sentAt)
- [x] 1.2 Add an index on `(user_id, sent_at)` in the same schema file
- [x] 1.3 Run `bunx drizzle-kit generate` to create the migration SQL

## 2. Constants

- [x] 2.1 Export `FROM_ADDRESS = process.env.FROM_ADDRESS` from `lib/constants.ts`

## 3. API Handler

- [x] 3.1 Add `POST /:id/test-send` route to `lib/api/templates.ts`
- [x] 3.2 Implement auth + owner/collaborator access check (reuse same pattern as PATCH)
- [x] 3.3 Implement rolling 24-hour rate-limit check against `test_email_sends`; return 429 with `{ error, limit, resetAt }` when exceeded
- [x] 3.4 Call `sendEmail` from `lib/email` with compiled template data and user's email as recipient
- [x] 3.5 Insert a row into `test_email_sends` after the send attempt (whether success or failure)
- [x] 3.6 Return 200 `{ ok: true, messageId }` on success or 502 `{ ok: false, code, message }` on provider failure

## 4. Client Hook

- [x] 4.1 Create `features/templates/hooks/useSendTestEmail.ts` — mutation POSTing to `/api/templates/:id/test-send` with `sampleData`

## 5. UI

- [x] 5.1 Add "Send Test" button to `TemplateEditorPage` header (between Share and Save buttons)
- [x] 5.2 Wire button to `useSendTestEmail`, passing parsed sample data (or `{}` on empty/invalid JSON)
- [x] 5.3 Show success toast on 200, rate-limit toast on 429, delivery-error toast on 502/failure
- [x] 5.4 Disable button and show spinner while mutation is pending

## 6. i18n

- [x] 6.1 Add `templateEditor.testSend` keys to `locales/en.json` (button, sending, success, rateLimitError, deliveryError)
