## ADDED Requirements

### Requirement: Database connection is available as a singleton
The system SHALL export a single Drizzle ORM client instance from `db/index.ts` backed by a PostgreSQL connection using the `postgres` driver. The connection string SHALL be read from `lib/constants.ts` (`DATABASE_URL`). The client SHALL be module-level so it is not re-created on hot-reload.

#### Scenario: Server module imports db client
- **WHEN** any server-side module imports `db` from `@/db`
- **THEN** the same Drizzle client instance is returned (singleton)

#### Scenario: DATABASE_URL is missing at startup
- **WHEN** `DATABASE_URL` is undefined
- **THEN** the application SHALL throw an error at startup (not silently use an undefined connection string)

### Requirement: Drizzle migration tooling is configured
The system SHALL have a `drizzle.config.ts` at the project root that points `schema` to `db/schema/` and `out` to `db/migrations/`. Running `bunx drizzle-kit generate` SHALL produce SQL migration files.

#### Scenario: Developer runs migration generation
- **WHEN** the developer runs `bunx drizzle-kit generate`
- **THEN** a SQL migration file is created in `db/migrations/` reflecting current schema

#### Scenario: Developer runs migrations
- **WHEN** the developer runs `bunx drizzle-kit migrate`
- **THEN** pending migrations are applied to the database

### Requirement: All API traffic under /api/* is handled by Hono
The system SHALL mount a Hono application at `app/api/[...route]/route.ts` using `@hono/next`'s `handle` adapter. The Next.js route SHALL export named handlers (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) all delegating to the same Hono instance. The Hono app instance SHALL be defined in `lib/api/index.ts`.

#### Scenario: HTTP GET request to /api/health
- **WHEN** a client sends `GET /api/health`
- **THEN** the Hono app responds (e.g., 200 OK) and no Next.js page handler intercepts the request

#### Scenario: HTTP POST request to an unregistered /api route
- **WHEN** a client sends a POST to an unregistered `/api/*` path
- **THEN** Hono returns 404 (not a Next.js 404 page)

### Requirement: Environment variables are accessed only through lib/constants.ts
The system SHALL export all `process.env.*` values from `lib/constants.ts`. No other file in the project SHALL reference `process.env` directly. At minimum, `DATABASE_URL` SHALL be exported.

#### Scenario: New code needs an environment variable
- **WHEN** a developer needs an env var in any file other than `lib/constants.ts`
- **THEN** the var MUST be imported from `@/lib/constants`, not read from `process.env`

#### Scenario: Build-time env var access
- **WHEN** the Next.js build runs
- **THEN** `lib/constants.ts` is the single location where env var access occurs

### Requirement: All UI strings are stored in locales/en.json and accessed via t()
The system SHALL have a `locales/en.json` file containing all UI string keys. The `utils/t.ts` module SHALL export a `t(key)` function that accepts only valid dot-path keys (type-safe) and returns the corresponding string. No hardcoded UI text strings SHALL appear in component files.

#### Scenario: Component renders a UI string
- **WHEN** a component needs to display a user-visible string
- **THEN** it calls `t("some.key")` and the string is defined in `locales/en.json`

#### Scenario: Invalid translation key at compile time
- **WHEN** a developer passes an unknown key to `t()`
- **THEN** TypeScript SHALL produce a compile error

### Requirement: shadcn/ui is initialized and components/ui/ is available
The system SHALL have shadcn/ui initialized (`components.json` present, `components/ui/` directory available). All UI primitives SHALL be sourced from shadcn/ui rather than hand-rolled.

#### Scenario: Developer adds a shadcn component
- **WHEN** the developer runs `bunx shadcn@latest add <component>`
- **THEN** the component is installed into `components/ui/` and importable from `@/components/ui/<component>`
