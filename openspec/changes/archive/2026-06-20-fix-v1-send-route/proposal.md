---
title: Fix v1/send API returning HTML for all HTTP methods
type: fix
status: proposed
---

## Problem

`POST /api/v1/send` (and all other methods on `/api/v1/*`) respond with the HTML of the login page instead of a JSON API response.

## Root Cause

`proxy.ts` (the Next.js 16 proxy, formerly middleware) gates every request behind session-cookie authentication. It only passes requests through if the path starts with `/login`, `/api/auth`, or `/api/health`. The `/api/v1/send` route is not in that list.

When an external caller sends `POST /api/v1/send` with `Authorization: Bearer <token>`, the proxy finds no session cookie, treats the request as unauthenticated, and redirects to `/login` — returning the HTML of the login page with a 302/200 status instead of a JSON response.

The v1 routes authenticate via Bearer API token, not session cookies. Their own auth guard (`getRequestUserId` in `lib/api/auth.ts`) validates the token after the request reaches the Hono handler — but the proxy never lets the request get that far.

## Proposed Fix

Add `/api/v1` to the `PUBLIC_PATHS` list in `proxy.ts`. This allows v1 API requests to pass through the proxy untouched so that Hono's route handler receives them and enforces Bearer token auth internally.

No change is needed to the Hono handler (`lib/api/v1.ts`) or the route file (`app/api/[...route]/route.ts`) — they are correct.

## Scope

- `proxy.ts` — one-line change, add `/api/v1` to `PUBLIC_PATHS`
- No schema changes, no new dependencies, no other files affected
