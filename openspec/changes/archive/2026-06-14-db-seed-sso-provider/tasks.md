## 1. Seed Script

- [x] 1.1 Create `db/seed.ts` that imports `SSO_BASE_URL`, `SSO_CLIENT_ID`, `SSO_CLIENT_SECRET` from `lib/constants.ts` and upserts a row into `sso_provider` with `providerId = "internal"`, `domain = new URL(SSO_BASE_URL).hostname`, and `oidcConfig = JSON.stringify({ issuer, clientId, clientSecret, discoveryEndpoint, authorizationEndpoint, tokenEndpoint, scopes })` using Drizzle's `.onConflictDoUpdate` on the `providerId` column
- [x] 1.2 Add `"db:seed": "bun run db/seed.ts"` to `package.json` scripts

## 2. Refactor lib/auth.ts

- [x] 2.1 Remove the `defaultSSO` array and all its contents from the `sso()` plugin call in `lib/auth.ts`, leaving the plugin initialized as `sso({})` or `sso()` with no arguments
