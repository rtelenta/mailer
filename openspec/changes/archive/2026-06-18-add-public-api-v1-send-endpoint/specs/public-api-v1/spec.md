## ADDED Requirements

### Requirement: POST /api/v1/send
Authenticated external callers MUST be able to send a transactional email by POSTing to `/api/v1/send` with a template name, recipient(s), optional Handlebars content, and optional per-send field overrides.

#### Scenario: Successful send with content variables
- **WHEN** a valid Bearer token is presented, `templateName` matches a template owned by the token's user, `to` is a valid email, and `content` supplies all Handlebars variables
- **THEN** the response is `200 { ok: true, messageId: "<provider-id>" }`

#### Scenario: Successful send to multiple recipients
- **WHEN** `to` is a non-empty array of valid email addresses
- **THEN** the email is delivered to all recipients and the response is `200 { ok: true, messageId }`

#### Scenario: Per-send override takes precedence over template default
- **WHEN** the request body includes `subject` (or `fromName`, `replyTo`, `preheader`)
- **THEN** the override value is used in place of the stored template value for that field

#### Scenario: Template not found
- **WHEN** `templateName` does not match any template owned by the authenticated user
- **THEN** the response is `404 { error: "Template not found" }`

#### Scenario: Missing or invalid Bearer token
- **WHEN** the `Authorization` header is absent, malformed, or contains an unknown/revoked token
- **THEN** the response is `401 { error: "Unauthorized" }`

#### Scenario: Invalid request body
- **WHEN** `templateName` is missing, `to` is not a valid email or array of valid emails, or any optional override fails Zod validation
- **THEN** the response is `422 { error: "Validation failed", issues: [...] }`

#### Scenario: Provider delivery failure
- **WHEN** the email delivery service returns `{ ok: false, code, message }`
- **THEN** the response is `400 { ok: false, code, message }` (same normalized shape)
