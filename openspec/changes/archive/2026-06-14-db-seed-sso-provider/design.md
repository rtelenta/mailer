## Context

Currently `lib/auth.ts` passes a `defaultSSO` array to the `@better-auth/sso` plugin. This array is the plugin's in-memory bypass — when a match is found there, the `sso_provider` table is never queried. Credentials and OIDC endpoint URLs are therefore baked into the deployed artifact.

The `sso_provider` table already exists (added in the initial migration). The `@better-auth/sso` plugin queries it by `domain` or `providerId` when `defaultSSO` produces no match. All that is needed is to insert a row and remove `defaultSSO`.

## Goals / Non-Goals

**Goals:**
- SSO provider config lives in the DB, populated once via a seed script
- `lib/auth.ts` contains no hardcoded credentials or endpoint URLs
- Fresh-environment setup is documented in the seed script itself (idempotent upsert)

**Non-Goals:**
- Admin UI for managing SSO providers
- Multiple SSO provider support
- Dynamic provider registration at runtime

## Decisions

**Use an explicit `db/seed.ts` script, not a migration.**
Migrations are for schema changes — they run in every environment automatically and must be idempotent by design. Seed data is environment-specific (different `SSO_CLIENT_ID` per env) and intentionally run once. Conflating the two makes migrations brittle.

**Upsert by `providerId` to make the seed idempotent.**
Running `bun run db:seed` twice must not fail. Use Drizzle's `.onConflictDoUpdate` on the `provider_id` unique constraint to update the row if it already exists.

**Read all values from `lib/constants.ts` in the seed script.**
The project rule is that `process.env` is only accessed in `lib/constants.ts`. The seed script must import from there, not read env vars directly.

**`oidcConfig` is stored as a JSON string in the `oidc_config` column.**
This matches the existing schema (`oidc_config text`) and how `@better-auth/sso` serializes it when it writes providers via its own API. The seed script must `JSON.stringify` the config object before inserting.

## Risks / Trade-offs

- **Empty DB on first boot before seed runs** → auth will throw "No provider found for the issuer" on any sign-in attempt. Mitigation: document `db:seed` as a required step after `db:migrate` in the project setup instructions.
- **`defaultSSO` removal is a breaking change in dev environments** that haven't run the seed. Developers must run `bun run db:seed` once after pulling this change. The seed is idempotent so re-running is safe.
