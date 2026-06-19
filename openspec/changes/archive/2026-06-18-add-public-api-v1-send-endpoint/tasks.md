## 1. Hono v1 Router

- [x] 1.1 Create `lib/api/v1.ts` with an empty `v1Router = new Hono()`
- [x] 1.2 Mount `v1Router` in `lib/api/index.ts` at path `/v1` (`app.route("/v1", v1Router)`)

## 2. POST /send Handler

- [x] 2.1 Add Zod schema `sendSchema` in `lib/api/v1.ts` validating `templateName`, `to` (string | string[]), `content` (optional object, default `{}`), and optional overrides (`subject`, `fromName`, `replyTo`, `preheader`)
- [x] 2.2 Implement `POST /send` handler: authenticate with `getRequestUserId`, parse body, look up template by name + userId, build `SendEmailParams`, call `sendEmail`, return 200/400/401/404/422 responses
- [x] 2.3 Normalize `to` to `string[]` before passing to `sendEmail` (handle both string and array inputs)
- [x] 2.4 Read `FROM_ADDRESS` from `lib/constants.ts` (add the constant export if not already present) for `defaults.fromAddress`

## 3. TypeScript + Verification

- [x] 3.1 Run `bun run tsc --noEmit` and fix any type errors
