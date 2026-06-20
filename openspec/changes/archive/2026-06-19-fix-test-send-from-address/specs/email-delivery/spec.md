## ADDED Requirements

### Requirement: email service rejects sends when FROM_ADDRESS is not configured
When `FROM_ADDRESS` is falsy (absent or empty string), `sendEmail` SHALL return a typed error result without invoking the provider.

#### Scenario: FROM_ADDRESS is missing from environment
- **WHEN** `FROM_ADDRESS` is `undefined` or an empty string at call time
- **THEN** `sendEmail` SHALL return `{ ok: false, code: 'MISSING_FROM_ADDRESS', message: 'FROM_ADDRESS env var is not configured' }` without calling `provider.send()`
