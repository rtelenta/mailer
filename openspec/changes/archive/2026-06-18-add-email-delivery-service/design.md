## Context

The mailer platform currently has no email-sending capability. Test-send and the public API are both blocked on a shared internal service that can compile MJML, render variables, and dispatch through Resend. This design establishes that service as a standalone module under `lib/email/`, keeping provider details isolated from callers.

## Goals / Non-Goals

**Goals:**
- Provide a single `sendEmail(params)` function that callers import and use without knowing which provider is active
- Compile MJML to HTML server-side (never in a browser bundle)
- Render Handlebars expressions against a caller-supplied content object
- Merge template defaults with optional per-call overrides before sending
- Return a normalized `EmailResult` discriminated union — never throw

**Non-Goals:**
- No public API route (future work)
- No test-send UI (future work)
- No retry / queue logic
- No multi-provider routing or fallback
- No email open/click tracking

## Decisions

### D-1: Module location — `lib/email/` not `features/`

`features/` is for domain logic tied to a UI surface. The delivery service has no UI surface and is shared across future features (test-send, public API). `lib/` is the correct home for cross-cutting server utilities.

*Alternative considered*: `services/email/` — rejected; the project doesn't use a `services/` layer and adding one for a single module would be premature.

### D-2: Provider behind a plain TypeScript interface, not a class hierarchy

A simple `EmailProvider` interface with a single `send` method is enough to swap implementations. Classes and inheritance add ceremony without benefit for a single-method contract.

### D-3: Resend adapter wraps SDK, never exposes it to callers

The `ResendEmailProvider` class imports the `resend` SDK and maps its response to `EmailResult`. Callers receive only `EmailResult` — no Resend types leak across the boundary. This is what makes the provider truly swappable.

### D-4: MJML compiled in the same process, not a child process

Running `mjml()` synchronously in-process is simpler and fast enough for transactional email volumes. A separate compilation process would only be warranted if compilation became a bottleneck (unlikely at this scale).

### D-5: Handlebars rendered after MJML compilation

MJML → HTML first, then Handlebars rendering on the resulting HTML. This means `{{variables}}` survive MJML compilation untouched (MJML does not strip unknown mustache syntax), and the rendered output is always valid HTML.

### D-6: `RESEND_API_KEY` exported from `lib/constants.ts`

Per project convention, no code reads `process.env` directly. The Resend adapter imports from `lib/constants.ts`.

## File Layout

```
lib/email/
  types.ts          # EmailProvider, SendEmailParams, EmailDefaults, EmailResult
  renderer.ts       # compileMjml(), renderHandlebars()
  resend.ts         # ResendEmailProvider implements EmailProvider
  index.ts          # sendEmail() — public API boundary (barrel justified here)
```

## Send Pipeline

```
sendEmail(params)
  1. compileMjml(params.mjml)        → html | error
  2. renderHandlebars(html, params.content) → renderedHtml
  3. merge defaults + overrides      → envelope
  4. provider.send({ renderedHtml, envelope }) → EmailResult
```

## Risks / Trade-offs

- **MJML package size** — `mjml` is a large dependency (~3 MB). Since this is server-only code it never affects client bundle size, but it adds to cold-start time in serverless environments. → Acceptable for now; can be lazy-loaded if cold starts become a concern.
- **Handlebars missing-variable behaviour** — rendering silently produces empty strings. Callers won't get an error if a template references `{{firstName}}` but the content object omits it. → Accepted; stricter validation belongs to callers (e.g., the public API validating its request body against the template's variable schema).
- **No Resend sandbox mode** — test sends will hit the real Resend API. → Mitigated by using Resend's test-mode API key in non-production environments.
