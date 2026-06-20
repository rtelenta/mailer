# Design: Bruno Collection for Public API v1

## Context

The mailer app exposes a public REST API (`POST /api/v1/send`) authenticated via raw API tokens used directly as Bearer tokens. API tokens are 64-character hex strings generated in Account Settings (`POST /api/tokens`); the plaintext is shown once at creation and stored only as a SHA-256 hash. There is no token-exchange endpoint — the raw token IS the bearer credential. There are no runnable examples today — developers must read specs and reverse-engineer the request shape.

Bruno is a file-based, open-source API client (like Postman/Insomnia) where every request is a plain `.bru` file committed alongside the codebase. This change adds a `bruno/` directory at the repo root with a collection covering the one endpoint a v1 API consumer needs.

## Goals / Non-Goals

**Goals:**
- Provide a runnable example for `POST /api/v1/send` authenticated with an API token
- Include an environment file so developers only need to fill in `baseUrl` and `apiToken`
- No changes to application source code

**Non-Goals:**
- Covering internal/admin or template CRUD endpoints
- CI/CD integration or Bruno CLI test running
- Any token exchange or auth flow (tokens are obtained out-of-band from Account Settings)

## Decisions

**Directory layout — `bruno/` at repo root**  
Rationale: Bruno collections are self-contained directories. Placing it at root makes it easy to open with the Bruno desktop app (`File → Open Collection → /path/to/mailer/bruno`).

**One request file, flat structure**  
No subdirectories. The collection covers one public endpoint so nesting adds no value.

**Environment file with `{{baseUrl}}` and `{{apiToken}}`**  
`baseUrl` defaults to `http://localhost:3000`. `apiToken` is left blank for the developer to fill in with their raw token from Account Settings. No auto-refresh needed since tokens don't expire.

**`.gitignore` for environment secrets**  
Bruno supports two environment files: `environments/local.bru` (gitignored, holds real values) and `environments/local.example.bru` (committed, holds placeholder values). We commit only the example file.

## Risks / Trade-offs

- **Bruno version compatibility** → `.bru` file format is stable across recent versions; no mitigation needed beyond noting the minimum version in the README.
- **Token obtained out-of-band** → Developers must create an API token in Account Settings before using the collection. The README explains this clearly.
