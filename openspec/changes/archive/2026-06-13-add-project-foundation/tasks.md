## 1. Dependencies

- [x] 1.1 Install Drizzle ORM and postgres driver: `bun add drizzle-orm postgres`
- [x] 1.2 Install drizzle-kit as a dev dependency: `bun add -d drizzle-kit`
- [x] 1.3 Install Hono and the Next.js adapter: `bun add hono` (uses built-in `hono/vercel` adapter)

## 2. Environment and Constants

- [x] 2.1 Create `lib/constants.ts` exporting `DATABASE_URL` from `process.env`
- [x] 2.2 Add `.env.local` (gitignored) with `DATABASE_URL=postgresql://...` for local development

## 3. Drizzle Setup

- [x] 3.1 Create `drizzle.config.ts` at the project root pointing `schema` to `./db/schema` and `out` to `./db/migrations`
- [x] 3.2 Create `db/schema/` directory with a placeholder `.gitkeep` (no tables yet)
- [x] 3.3 Create `db/index.ts` with the Drizzle singleton: import `DATABASE_URL` from `@/lib/constants`, construct the `postgres` client, and export `db = drizzle(client)`
- [x] 3.4 Add `db:generate` and `db:migrate` scripts to `package.json` using `drizzle-kit`

## 4. Hono API Layer

- [x] 4.1 Create `lib/api/index.ts` that constructs and exports a named `app` Hono instance with a `GET /api/health` route returning `{ ok: true }`
- [x] 4.2 Create `app/api/[...route]/route.ts` importing `handle` from `hono/vercel` and the `app` from `@/lib/api`, exporting named handlers `GET`, `POST`, `PUT`, `PATCH`, `DELETE`

## 5. Locale and t() Utility

- [x] 5.1 Verify `utils/t.ts` exports `t()` with correct dot-path type inference (already exists — read and confirm it matches the pattern in CLAUDE.md; no changes needed if correct)
- [x] 5.2 Verify `locales/en.json` exists and is valid JSON (already exists as `{}` — confirm it's importable and the `t()` type resolves correctly)

## 6. shadcn/ui Initialization

- [x] 6.1 Run `bunx shadcn@latest init` — choose Tailwind CSS v4 style, default component alias `@/components/ui`, and no base color (or neutral)
- [x] 6.2 Confirm `components.json` is created at the project root
- [x] 6.3 Confirm `components/ui/` directory exists and is importable

## 7. Verification

- [x] 7.1 Run `bun run build` and confirm no TypeScript or build errors
- [x] 7.2 Run `bun run dev` and `curl http://localhost:3000/api/health` — confirm Hono responds with `{ ok: true }`
- [x] 7.3 Run `bunx drizzle-kit generate` — confirm it runs without error (even with an empty schema)
