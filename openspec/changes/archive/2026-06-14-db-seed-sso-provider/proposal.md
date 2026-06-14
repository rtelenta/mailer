## Why

The SSO provider config in `lib/auth.ts` is hardcoded via `defaultSSO`, bypassing the `sso_provider` DB table entirely. This couples credentials and OIDC endpoints directly to server code, making it impossible to rotate or reconfigure the provider without a redeploy. Moving to a DB-seeded provider aligns with how `@better-auth/sso` is designed to work in production.

## What Changes

- **Remove** the `defaultSSO` array from `lib/auth.ts`; the `sso` plugin will be initialized with no static config
- **Add** a seed script at `db/seed.ts` that inserts the `sso_provider` row using values from env vars (`SSO_BASE_URL`, `SSO_CLIENT_ID`, `SSO_CLIENT_SECRET`)
- **Add** a `db:seed` script to `package.json` that runs `db/seed.ts`

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `sso-auth`: How the SSO provider is registered changes — from hardcoded `defaultSSO` in `lib/auth.ts` to a DB row inserted by a seed script. The auth flow and all external behavior remain unchanged.

## Impact

- **Files changed**: `lib/auth.ts`, `db/seed.ts` (new), `package.json`
- **No DB schema changes** — `sso_provider` table already exists
- **No API changes, no UI changes**
- **No breaking changes** to the auth flow
- **Env vars used by seed**: `SSO_BASE_URL`, `SSO_CLIENT_ID`, `SSO_CLIENT_SECRET` (already required)
- **Local setup**: developers must run `bun run db:seed` after `bun run db:migrate` on a fresh database
