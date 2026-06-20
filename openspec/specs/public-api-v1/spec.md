# public-api-v1

## Purpose

Defines the public REST API (v1) that allows authenticated external callers to programmatically send transactional emails on behalf of their account.

## Requirements

### Requirement: POST /api/v1/send
Authenticated external callers MUST be able to send a transactional email by POSTing to `/api/v1/send` with a template name, recipient(s), optional Handlebars content, and optional per-send field overrides.

The Next.js proxy MUST NOT apply session-cookie authentication to `/api/v1/*` paths; these routes authenticate exclusively via Bearer API token within the route handler. The proxy MUST NOT redirect these requests to the login page.

#### Scenario: Successful send with content variables
- **WHEN** a valid Bearer token is presented, `templateName` matches a template owned by the token's user, `to` is a valid email, and `content` supplies all Handlebars variables
- **THEN** the response is `200 { ok: true, messageId: "<provider-id>" }`

#### Scenario: Successful send to multiple recipients
- **WHEN** `to` is a non-empty array of valid email addresses
- **THEN** the email is delivered to all recipients and the response is `200 { ok: true, messageId }`

#### Scenario: Per-send override takes precedence over template default
- **WHEN** the request body includes `subject` (or `fromName`, `replyTo`)
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

### Requirement: Bruno collection for v1 API
A Bruno API collection SHALL be provided in the `bruno/` directory at the repository root, covering the public v1 API endpoints.

The collection MUST include:
- A request for `POST /api/v1/send` authenticated via `Authorization: Bearer {{apiToken}}`
- An example environment file (`environments/local.example.bru`) with placeholder values for `baseUrl` and `apiToken`
- A `README.md` explaining how to open the collection, obtain an API token from Account Settings, and run the send request

Secrets (real `apiToken` values) MUST NOT be committed; a gitignored `environments/local.bru` file is used for actual values.

#### Scenario: Developer sends a transactional email
- **WHEN** a developer provides a valid `apiToken` in their local environment and sends the `POST /api/v1/send` request with a valid `templateName` and `to` address
- **THEN** the email is delivered and the response is `200 { ok: true, messageId }`
