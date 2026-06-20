## ADDED Requirements

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
