---
title: Design — Fix v1/send API proxy bypass
---

## What changes

**`proxy.ts`** — add `/api/v1` to `PUBLIC_PATHS`.

```ts
// before
const PUBLIC_PATHS = ["/login", "/api/auth", "/api/health"];

// after
const PUBLIC_PATHS = ["/login", "/api/auth", "/api/health", "/api/v1"];
```

The proxy checks `PUBLIC_PATHS` with `pathname.startsWith(path)`, so `/api/v1` covers `/api/v1/send` and any future v1 endpoints automatically.

## Why this is safe

The v1 routes are not unauthenticated — they enforce Bearer token auth in `getRequestUserId` (`lib/api/auth.ts`) inside the Hono handler. The proxy is session-auth for the web UI; skipping it for `/api/v1` just means v1 endpoints use their own auth layer, which they already do.

## What is NOT changing

- `app/api/[...route]/route.ts` — correct as-is
- `lib/api/v1.ts` — correct as-is; `getRequestUserId` still returns 401 for missing/invalid tokens
- `lib/api/index.ts` — no changes
- No new files, no schema changes, no dependency changes
