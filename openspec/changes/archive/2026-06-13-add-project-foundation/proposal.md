## Why

The project has no database connection, API layer, or shared infrastructure in place. Before any feature work can begin, the core plumbing must exist: a Postgres connection via Drizzle ORM, a Hono app mounted under `/api/*`, a `lib/constants.ts` for all env vars, a `t()` util backed by `locales/en.json` for all UI copy, and shadcn/ui initialized for the component library.

## What Changes

- Initialize Drizzle ORM with a PostgreSQL connection (`db/` folder, schema and migration setup)
- Create and mount a Hono app under `/api/[...route]/route.ts` handling all `/api/*` traffic
- Create `lib/constants.ts` as the single file allowed to access `process.env`
- Create `locales/en.json` as the single source of truth for all UI strings
- Create `utils/t.ts` with a `t(key)` utility that reads from `locales/en.json`
- Initialize shadcn/ui (config, `components/ui/` directory, base components as needed)

## Capabilities

### New Capabilities

- `project-foundation`: Core infrastructure — DB connection, API routing, env constants, i18n util, and UI component library baseline

### Modified Capabilities

<!-- None — this is greenfield setup; no existing specs to modify -->

## Impact

- **DB**: Adds `db/schema/` and `db/migrations/`; requires `DATABASE_URL` env var
- **API**: All `/api/*` routes now flow through Hono; no existing routes affected
- **Dependencies**: Adds `drizzle-orm`, `drizzle-kit`, `postgres` (or `@neondatabase/serverless`), `hono`, `@hono/next`, shadcn/ui tooling
- **Env vars required**: `DATABASE_URL`
- **Non-goals**: No auth wiring, no feature routes, no email sending — foundation only
