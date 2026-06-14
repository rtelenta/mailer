## Context

The project was bootstrapped with `create-next-app` and currently has only Next.js, React, and Tailwind. No database, API layer, or component library is wired up. `utils/t.ts` and `locales/en.json` already exist (created at init time) so those need verification/population rather than creation.

## Goals / Non-Goals

**Goals:**
- Wire Drizzle ORM to a PostgreSQL database with a stable connection singleton
- Mount a Hono app at `app/api/[...route]/route.ts` so all `/api/*` traffic routes through it
- Create `lib/constants.ts` as the sole `process.env` access point
- Populate `locales/en.json` with an initial structure; verify `utils/t.ts` matches conventions
- Initialize shadcn/ui so `components/ui/` is usable

**Non-Goals:**
- No auth setup (`lib/auth.ts` is a later change)
- No feature routes inside Hono — only the app scaffold
- No DB schema tables — only the connection + migration tooling
- No seeding or test data

## Decisions

### Drizzle: `postgres` driver (not `node-postgres`)

**Decision**: Use the `postgres` (`node_modules/postgres`) package as the Drizzle driver, not `pg`.

**Rationale**: Bun's native TCP stack works better with `postgres` (which uses raw TCP) than with `pg` (which relies on Node.js net internals that Bun partially emulates). Drizzle's `drizzle-orm/postgres-js` adapter wraps it cleanly.

**Alternatives considered**: `@neondatabase/serverless` — only needed for edge/serverless runtimes; this is a standard Bun server.

```ts
// db/index.ts
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { DATABASE_URL } from "@/lib/constants";

const client = postgres(DATABASE_URL!);
export const db = drizzle(client);
```

Schema files live in `db/schema/` (one file per domain). Migration outputs go to `db/migrations/`.

`drizzle.config.ts` at the project root points to both.

### Hono: Next.js route handler adapter

**Decision**: Use `@hono/next` (the `handle` adapter) to mount Hono inside a Next.js catch-all route.

**File**: `app/api/[...route]/route.ts`

```ts
import { handle } from "@hono/next";
import { app } from "@/lib/api";

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
```

`lib/api/index.ts` creates and exports the Hono app instance. Feature routes will be registered here as sub-apps.

**Alternatives considered**: Mounting Hono directly as a middleware — less idiomatic with the App Router and harder to tree-shake.

### `lib/constants.ts` — single env access point

All `process.env.*` reads are centralized here. Every other file imports from this module. At this stage only `DATABASE_URL` is exported; SSO vars and others are added as features land.

```ts
// lib/constants.ts
export const DATABASE_URL = process.env.DATABASE_URL;
```

### `utils/t.ts` + `locales/en.json`

Both already exist. `utils/t.ts` already implements the type-safe dot-path lookup correctly. `locales/en.json` is currently empty (`{}`). At this stage it should remain minimal — only populate keys as actual UI copy is introduced by feature changes.

### shadcn/ui initialization

Run `bunx shadcn@latest init` interactively (or with flags) to generate `components.json` and the `components/ui/` directory. No components are pre-installed — they are added per feature. Tailwind v4 is already installed.

## Risks / Trade-offs

- **`postgres` + Bun in dev** → Bun's hot-reload may duplicate the connection pool across HMR cycles. Mitigation: use a module-level singleton pattern (already shown in `db/index.ts` above).
- **Hono catch-all vs Next.js middleware** → `/api/*` is fully owned by Hono; any accidental Next.js API route under `app/api/` other than `[...route]` will shadow Hono. Mitigation: document this constraint; add a lint rule or comment in the route file.
- **`DATABASE_URL` undefined at build time** → Next.js runs `lib/constants.ts` during the build. If `DATABASE_URL` is not set, Drizzle client construction fails. Mitigation: guard with `!` (non-null assertion) in `drizzle()` call and add a startup check.
