# Local Setup 🔧

Step-by-step guide for running Mailer in a local development environment.

## Prerequisites 📋

- [Bun](https://bun.sh) ≥ 1.0
- PostgreSQL (local instance or [Neon](https://neon.tech))
- A running [SSO](https://github.com/rtelenta/sso) instance (handles all authentication)
- A [Resend](https://resend.com) account with a verified sender domain

## Environment Variables ⚙️

Copy the example file and fill in each value:

```bash
cp .env.example .env
```

| Variable              | Description                                              | Example                          |
| --------------------- | -------------------------------------------------------- | -------------------------------- |
| `DATABASE_URL`        | PostgreSQL connection string                             | `postgres://user:pass@localhost/mailer` |
| `SSO_BASE_URL`        | Base URL of the SSO service                              | `http://sso.localhost:3005`      |
| `SSO_CLIENT_ID`       | OAuth client ID registered in the SSO                   | `mailer`                         |
| `SSO_CLIENT_SECRET`   | OAuth client secret registered in the SSO               | `supersecret`                    |
| `BETTER_AUTH_SECRET`  | Secret used to sign sessions                             | _(see below)_                    |
| `NEXT_PUBLIC_APP_URL` | Public base URL of this app                              | `http://mailer.localhost:3006`   |
| `RESEND_API_KEY`      | API key from your Resend account                         | `re_xxxxxxxxxxxx`                |
| `FROM_ADDRESS`        | Verified sender address used for all outgoing email      | `noreply@yourdomain.com`         |

Generate a secure `BETTER_AUTH_SECRET`:

```bash
openssl rand -base64 32
```

## Database Setup 🗄️

Run migrations to create all tables:

```bash
bun run db:migrate
```

Seed the database with example data:

```bash
bun run db:seed
```

If you change the schema, generate a new migration file first:

```bash
bun run db:generate
bun run db:migrate
```

## SSO Integration 🔐

Mailer delegates all authentication to the [SSO](https://github.com/rtelenta/sso). Users are redirected there to sign in — they never enter credentials in Mailer itself.

To wire it up:

1. Follow the [SSO local setup guide](https://github.com/rtelenta/sso/blob/master/docs/local-setup.md) to get it running.
2. Register a new OAuth client in the SSO for Mailer (the SSO seed script creates a `dev-client` you can use as a reference).
3. Set `SSO_BASE_URL`, `SSO_CLIENT_ID`, and `SSO_CLIENT_SECRET` in `.env` to match the registered client.
4. Set `NEXT_PUBLIC_APP_URL` to this app's public URL so the SSO can redirect back after sign-in.

## Running the App 🚀

```bash
bun run dev
```

Open [http://localhost:3006](http://localhost:3006). You will be redirected to the SSO to sign in on first visit.
