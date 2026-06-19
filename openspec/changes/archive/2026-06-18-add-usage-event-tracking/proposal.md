# Proposal: add-usage-event-tracking

## What

Add a metering layer that records usage events from the two existing send paths — the test-send endpoint and the public API `/v1/send` — into a Drizzle-backed store designed for aggregation. Every successful send, every failed send, and every public API call is recorded as a structured event tied to the acting user and (where applicable) the template.

## Why

The dashboard will need to show per-account usage over time: email send volume, API call counts, error rates, and template-level breakdowns. Recording raw events now, before the UI exists, keeps the instrumentation in the correct layer (server-side, alongside the send logic) and avoids retrofitting later. The events table is modeled as an append-only log so aggregation queries (GROUP BY day, template, status) are straightforward.

## Scope

- **In scope:**
  - New `usage_events` Drizzle table + migration
  - A `trackEvent(...)` helper in `lib/usage/events.ts`
  - Instrumentation of `POST /api/templates/:id/test-send` (success + failure)
  - Instrumentation of `POST /api/v1/send` (success + failure)
  - Fire-and-forget emission — events MUST NOT block or alter the response to the caller

- **Out of scope:**
  - Dashboard UI (separate change)
  - Aggregation queries / analytics helpers (separate change)
  - Quota enforcement based on event counts
  - Any public API endpoint for reading events

## Dependencies

- `add-test-email-sending` — provides the test-send handler to instrument
- `add-public-api-v1-send-endpoint` — provides the `/v1/send` handler to instrument

## Event Types

| `eventType`          | Emitted when                                         |
|----------------------|------------------------------------------------------|
| `test_send_ok`       | Test-send completes successfully                     |
| `test_send_error`    | Test-send fails at the delivery provider             |
| `api_send_ok`        | `/v1/send` completes successfully                    |
| `api_send_error`     | `/v1/send` fails at the delivery provider            |

## Non-Goals

- Deduplication
- Guaranteed delivery / event queue
- Real-time streaming
