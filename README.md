# Mailer 📬

_Email template management and transactional delivery platform. Build and manage MJML templates in the UI, then send emails programmatically via a simple API._

Authentication is delegated to the [SSO](https://github.com/rtelenta/sso) — users sign in there, never here.

## Getting Started 🚀

See [docs/local-setup.md](docs/local-setup.md) for a detailed step-by-step guide.

### Prerequisites 📋

- [Bun](https://bun.sh) ≥ 1.0
- PostgreSQL database (local or [Neon](https://neon.tech))
- A running [SSO](https://github.com/rtelenta/sso) instance
- A [Resend](https://resend.com) account and API key

### Installation 🔧

1. Clone and install dependencies

```bash
git clone https://github.com/rtelenta/mailer
cd mailer
bun install
```

2. Configure environment variables

```bash
cp .env.example .env
# Edit .env with your values — see docs/local-setup.md for details
```

3. Run database migrations

```bash
bun run db:migrate
```

4. Seed the database

```bash
bun run db:seed
```

5. Start the development server

```bash
bun run dev
```

Open [http://mailer.localhost:3006](http://mailer.localhost:3006) to see the app.

## Scripts ⚙️

| Script                | Description                                          |
| --------------------- | ---------------------------------------------------- |
| `bun run dev`         | Start the Next.js development server on port 3006    |
| `bun run build`       | Build for production                                 |
| `bun run start`       | Start the production server                          |
| `bun run lint`        | Run ESLint                                           |
| `bun run db:generate` | Generate Drizzle migration files from schema changes |
| `bun run db:migrate`  | Apply pending migrations to the database             |
| `bun run db:seed`     | Seed the database with example data                  |

## Documentation 📖

| Resource                                   | Description                                                                                                   |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| [docs/local-setup.md](docs/local-setup.md) | Step-by-step local environment setup — env vars, database, migrations, SSO wiring                             |
| [docs/api.md](docs/api.md)                 | v1 send API reference — token auth, request/response examples, batch sending, error codes                     |
| [bruno/](bruno/)                           | Bruno API collection — interactive examples for the send endpoint. Open in [Bruno](https://www.usebruno.com/) |

## Built with 🛠️

- [Bun](https://bun.sh) — runtime and package manager
- [Next.js 16](https://nextjs.org) — App Router + React 19
- [better-auth](https://www.better-auth.com/) — session management and SSO integration
- [Drizzle ORM](https://orm.drizzle.team/) — type-safe ORM
- [PostgreSQL](https://www.postgresql.org/) — database
- [Resend](https://resend.com) — transactional email delivery
- [MJML](https://mjml.io) — responsive email templating
- [Handlebars](https://handlebarsjs.com/) — template variable substitution
- [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) — styling and components
- [Hono](https://hono.dev/) — API layer
- [TanStack Query](https://tanstack.com/query) — client-side data fetching
- [Zod](https://zod.dev/) — schema validation

---

Made with ❤️ by [Renzo Telenta](https://github.com/rtelenta)
