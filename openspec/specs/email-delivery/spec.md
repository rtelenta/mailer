# email-delivery

Internal server-side service that compiles, renders, and sends emails through a pluggable provider.

## Functional Requirements

### FR-1: MJML Compilation
- The service MUST compile MJML source strings to HTML before sending
- Compilation errors MUST be surfaced as typed errors in the result, not thrown exceptions

### FR-2: Handlebars Variable Rendering
- After MJML compilation, the service MUST render Handlebars `{{variable}}` expressions against a caller-supplied content object
- Missing variables MUST render as empty strings (no error)

### FR-3: Template Defaults
- The service MUST accept a `defaults` object containing: `subject`, `fromName`, `replyTo`
- Callers MAY supply per-call overrides for any of these fields; overrides take precedence over defaults

### FR-4: Send
- The service MUST send the compiled, rendered email via the configured provider
- On success, the service MUST return a normalized result containing at minimum the provider message ID
- On failure, the service MUST return a normalized error result with a machine-readable error code and a message; it MUST NOT throw
- The `from` header MUST use the RFC 2822 quoted-string display name format: `"<fromName>" <fromAddress>`. Plain unquoted concatenation is NOT acceptable.
- The `replyTo` address MUST be passed to the Resend SDK using the camelCase key `replyTo` (not `reply_to`)

### FR-5: Pluggable Provider
- The delivery backend MUST be abstracted behind a `EmailProvider` interface
- The initial implementation MUST use Resend via the `resend` SDK
- Swapping the provider MUST require no changes to callers of the delivery service

## Interface Contract

```ts
// Provider interface
interface EmailProvider {
  send(params: ProviderSendParams): Promise<EmailResult>;
}

// Per-send parameters (callers supply these)
interface SendEmailParams {
  mjml: string;
  content: Record<string, unknown>;
  defaults: EmailDefaults;
  overrides?: Partial<EmailDefaults>;
}

interface EmailDefaults {
  subject: string;
  fromName: string;
  fromAddress: string;
  replyTo?: string;
}

// Normalized result
type EmailResult =
  | { ok: true; messageId: string }
  | { ok: false; code: string; message: string };
```

### FR-6: Missing Configuration Guard
- When `FROM_ADDRESS` is absent or empty, `sendEmail` SHALL return `{ ok: false, code: 'MISSING_FROM_ADDRESS', message: 'FROM_ADDRESS env var is not configured' }` without invoking the provider

## Non-Functional Requirements

- The service is server-side only; no code from this module may be imported in Client Components
- `RESEND_API_KEY` must be read exclusively from `lib/constants.ts`
- All types are exported from the module boundary; callers depend on types, not internals
