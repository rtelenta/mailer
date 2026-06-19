## Context

The project has two send paths that need instrumentation:

1. `POST /api/templates/:id/test-send` — in `lib/api/templates.ts:210`. Handler runs the full send pipeline and returns 200/429/502. Rate-limit records already land in `test_email_sends`; usage events are a separate concern.
2. `POST /api/v1/send` — in `lib/api/v1.ts:22`. Handler returns 200 on success, 400 on delivery failure.

Neither path currently emits any general-purpose usage events. The `test_email_sends` table exists only for rate-limit enforcement (rolling 24 h window) and is not designed for aggregation.

## Goals / Non-Goals

**Goals:**
- Append-only `usage_events` table suited to `GROUP BY` aggregation (by day, user, template, type)
- A single `trackEvent(params)` helper used by both handlers
- Fire-and-forget emission (awaited but never throwing — errors are swallowed)
- Record four event types: `test_send_ok`, `test_send_error`, `api_send_ok`, `api_send_error`

**Non-Goals:**
- Aggregation query helpers or analytics functions
- Dashboard UI
- Quota enforcement from event counts
- Deduplication or event queue guarantees

## Decisions

**1. New `usage_events` table, not reusing `test_email_sends`**

`test_email_sends` is modeled for a rolling-window count query (index on `(user_id, sent_at)`). Mixing usage analytics into it would require adding columns (`event_type`, `templateId`, `error_code`) and changing the semantic of the table. A dedicated table is cleaner and keeps rate-limit logic isolated.

**2. `trackEvent` helper in `lib/usage/events.ts`**

Central helper keeps DB imports out of handler files (handlers already import enough). Accepts a typed union of event payloads. Wraps the insert in try/catch and never re-throws — handlers must not fail because of a metering side-effect.

**3. Fire-and-forget via `await` (not truly detached)**

The insert is fast (single row, no joins). We `await` it but wrap in a top-level try/catch inside the helper so any DB error is silently logged, not propagated. This avoids uncaught promise warnings from truly detached promises while still not blocking the response in practice (the `await` adds negligible latency on a localhost DB write).

**4. Schema: `eventType` as `text`, `metadata` as `jsonb`**

`eventType` is a constrained string enum (`test_send_ok` | `test_send_error` | `api_send_ok` | `api_send_error`). Using `text` (not a Postgres enum type) keeps migrations simple — adding a new event type requires no `ALTER TYPE`. A `jsonb` `metadata` column stores event-specific data (`messageId`, `errorCode`, `errorMessage`) without requiring schema changes per event type.

**5. Indexes**

- `(user_id, created_at)` — time-series queries per user
- `(user_id, event_type, created_at)` — filtered aggregations (e.g. "send_ok count by day for user X")
- `(template_id, created_at)` where `template_id IS NOT NULL` — template-level breakdown

**6. `templateId` is nullable**

API sends always have a template; test sends always have a template. But the column is nullable to keep the schema flexible if non-template event types are added later, and to avoid a FK failure if a template is deleted (see below).

**7. No CASCADE DELETE on `templateId` FK**

We use `ON DELETE SET NULL` so deleting a template doesn't erase historical send counts. `userId` FK uses `ON DELETE CASCADE` — deleting an account removes its events.

## Risks / Trade-offs

- **Volume**: High-frequency API callers will accumulate rows quickly. No retention policy is defined here; that's a future concern.
- **Swallowed errors**: Instrumentation failures are silent. If the `usage_events` table is missing or the insert fails, no alert is raised. Acceptable for a metering layer that doesn't affect billing.
- **Latency**: The `await` adds a DB round-trip after the main response data is ready but before the HTTP response is written. On a local DB this is sub-millisecond; on a remote DB it may add ~1–5 ms. Acceptable given the fire-and-forget intent.
