# Proposal: Bruno Collection for Public API v1

## What

Add a Bruno API collection under `bruno/` that covers the public v1 API endpoints. The collection will serve as interactive, version-controlled documentation for developers integrating with the mailer API, providing runnable examples for authentication token creation and the `POST /api/v1/send` endpoint.

## Why

The public API v1 is documented in specs and code but has no runnable examples. Developers consuming the API currently have no quick way to test it locally without writing their own requests from scratch. A Bruno collection solves this: it lives in the repo, requires no cloud sync, and works offline — making it the natural fit for an open-source-friendly, file-based API client.

## Scope

- New top-level `bruno/` directory containing a Bruno collection
- Collection covers:
  - Authentication: `POST /api/auth/oauth2/token` (obtain a bearer token from an API key)
  - Send email: `POST /api/v1/send` (send a transactional email using a named template)
- Environment file with variables (`baseUrl`, `apiKey`, `bearerToken`)
- `README.md` inside `bruno/` explaining how to open and use the collection
- No changes to application code

## Out of Scope

- Internal/admin API endpoints
- Template CRUD endpoints (separate concern)
- CI automation or test running via Bruno CLI
