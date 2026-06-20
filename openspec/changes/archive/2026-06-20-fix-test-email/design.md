## Context

`lib/email/resend.ts` constructs the Resend API call. It builds the `from` header by concatenating `fromName` and `fromAddress` without quoting the name, and passes `replyTo` using the snake_case key `reply_to` that the SDK does not recognise on the input side (it converts `email.replyTo` → `reply_to` internally).

## Goals / Non-Goals

**Goals:**
- Fix the `from` field so any `fromName` value (including names with commas or other RFC 2822 special chars) produces a valid address header
- Fix `replyTo` so it is actually passed through to Resend

**Non-Goals:**
- Escaping double-quote characters inside `fromName` (reserved for a future hardening change if needed)
- Changing the `fromName` validation rules in the template editor schema

## Decisions

**Quoted-string display name**: RFC 2822 allows two forms for the display name — an unquoted "atom" (no special chars allowed) or a quoted string (arbitrary characters, including commas). Wrapping in double-quotes is universally safe. The resulting from string becomes `"Name" <email@domain>`, which Resend and all downstream MTAs accept.

**`replyTo` camelCase**: SDK v6's `parseEmailToApiOptions` reads `email.replyTo` and writes `reply_to` to the API payload. Callers must use camelCase. The current `{ reply_to: ... }` spread lands on the SDK object as an unrecognised property and is silently ignored.

## Risks / Trade-offs

- Quoting the display name changes the wire format of the `From` header slightly (same semantics, different encoding). This has no user-visible impact.
- If `fromName` itself contains an unescaped `"` character the quoted-string would be malformed. The template editor allows any string for `fromName` up to 255 chars, so this is a theoretical risk but not currently observed. A `replace('"', '\\"')` escape is the mitigation if needed.
