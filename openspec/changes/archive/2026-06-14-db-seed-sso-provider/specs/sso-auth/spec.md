## MODIFIED Requirements

### Requirement: better-auth is configured as an OAuth2 client for the internal SSO
The system SHALL configure `better-auth` in `lib/auth.ts` using the `@better-auth/sso` plugin with no `defaultSSO` array. The plugin SHALL resolve the SSO provider at runtime by querying the `sso_provider` table. It SHALL use the Drizzle adapter backed by the existing `db` singleton. The `BETTER_AUTH_SECRET` env var SHALL be used as the signing secret. The config MUST NOT hardcode credentials or endpoint URLs — all runtime values SHALL come from the database row seeded by `db/seed.ts`.

#### Scenario: Auth config initializes without error
- **WHEN** the server module `lib/auth.ts` is imported
- **THEN** the `auth` export is a valid better-auth instance with the SSO plugin registered and no `defaultSSO`

#### Scenario: Missing auth env vars at startup
- **WHEN** `SSO_BASE_URL`, `SSO_CLIENT_ID`, `SSO_CLIENT_SECRET`, or `BETTER_AUTH_SECRET` is undefined
- **THEN** the application SHALL throw at startup rather than silently proceeding with broken auth

## ADDED Requirements

### Requirement: SSO provider is seeded into the database
The system SHALL provide a seed script at `db/seed.ts` that inserts the internal SSO provider row into the `sso_provider` table using values from env vars (`SSO_BASE_URL`, `SSO_CLIENT_ID`, `SSO_CLIENT_SECRET`). The seed MUST use an upsert (conflict on `provider_id`) so it is safe to run multiple times. The `oidc_config` column MUST be populated as a JSON string containing `issuer`, `clientId`, `clientSecret`, `discoveryEndpoint`, `authorizationEndpoint`, `tokenEndpoint`, and `scopes`. A `db:seed` npm script SHALL be added to `package.json` to run this file.

#### Scenario: Seed inserts provider on fresh database
- **WHEN** `bun run db:seed` is run against a migrated but empty database
- **THEN** a row is inserted into `sso_provider` with `provider_id = "internal"`, the correct `domain`, and a valid `oidc_config` JSON string

#### Scenario: Seed is idempotent
- **WHEN** `bun run db:seed` is run a second time
- **THEN** the existing row is updated and no error is thrown

#### Scenario: Sign-in resolves provider from DB
- **WHEN** a client POSTs to `POST /api/auth/sign-in/sso` after the seed has been run
- **THEN** better-auth resolves the provider from the `sso_provider` table and returns a redirect to the SSO authorization endpoint
