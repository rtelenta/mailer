## Context

`sendEmail` in `lib/email/index.ts` constructs the sender envelope as `{ ...params.defaults, ...params.overrides }` and passes `envelope.fromAddress` (sourced from `FROM_ADDRESS` via the handler) directly to the provider. When `FROM_ADDRESS` is `undefined`, `FROM_ADDRESS ?? ""` is used, resulting in an empty string. Resend rejects the empty from address and returns an error, which the handler surfaces as a 502. `FROM_ADDRESS` is also absent from `.env.example`, so developers have no signal that the variable is required.

## Goals / Non-Goals

**Goals:**
- Add a guard in `sendEmail` that catches a missing/empty `FROM_ADDRESS` before the provider call
- Document `FROM_ADDRESS` in `.env.example`
- Add `FROM_ADDRESS` to `.env` with the Resend test sender so local dev works without a custom domain

**Non-Goals:**
- Runtime config validation at startup (startup guards are a separate concern)
- Changing the 502 status code for provider failures (it is correct per spec)
- Adding a verified custom domain (environment-specific, not a code change)

## Decisions

**Guard location — `lib/email/index.ts` not the handler**: The `sendEmail` function already owns the `envelope` construction and provider dispatch. Adding the guard there means all callers (test-send today, public-send tomorrow) benefit automatically.

**Error code `MISSING_FROM_ADDRESS`**: Makes the failure machine-readable and distinguishable from `RESEND_ERROR` / `RESEND_EXCEPTION` so the UI or logs can surface a useful message.

**`.env` default `onboarding@resend.dev`**: Resend's test sender is accepted by any valid Resend API key without domain verification. Using it as the local dev default unblocks the feature immediately. It is a dev-only value and will not be committed to production config.

## Risks / Trade-offs

- Using `onboarding@resend.dev` sends test emails that appear to come from Resend's domain — fine for local dev, but must be replaced with a verified sender before deploying to production.
