## MODIFIED Requirements

### Requirement: Environment variables are accessed only through lib/constants.ts
The system SHALL export all `process.env.*` values from `lib/constants.ts`. No other file in the project SHALL reference `process.env` directly. At minimum, `DATABASE_URL`, `SSO_BASE_URL`, `SSO_CLIENT_ID`, `SSO_CLIENT_SECRET`, `BETTER_AUTH_SECRET`, and `NEXT_PUBLIC_APP_URL` SHALL be exported.

#### Scenario: New code needs an environment variable
- **WHEN** a developer needs an env var in any file other than `lib/constants.ts`
- **THEN** the var MUST be imported from `@/lib/constants`, not read from `process.env`

#### Scenario: Build-time env var access
- **WHEN** the Next.js build runs
- **THEN** `lib/constants.ts` is the single location where env var access occurs
