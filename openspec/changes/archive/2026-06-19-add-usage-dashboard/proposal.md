# Proposal: add-usage-dashboard

## Why

Users need visibility into how they are using the platform — how many templates they have, which templates are sending the most, send volume over time, API call counts, and error rates. The `usage_events` table (added in `add-usage-event-tracking`) already records this data; the dashboard surfaces it.

## What Changes

- New post-login dashboard page at `/dashboard` showing aggregated usage metrics
- Server-side aggregation queries over `usage_events` to produce summary stats
- Four chart/table widgets: sends-over-time (line chart), sends-per-template (bar chart or table), API call counts, and error rate
- Summary stat cards: total template count, total sends, error rate percentage

## Capabilities

### New Capabilities

- `usage-dashboard`: Post-login dashboard page with summary cards (template count, total sends, error rate), sends-over-time line chart, sends-per-template breakdown, and API call vs. test-send counts — all aggregated from `usage_events`.

### Modified Capabilities

_(none — `usage_events` table schema is unchanged; only read queries are added)_

## Impact

- **UI**: New page `app/dashboard/page.tsx`, feature module `features/dashboard/`
- **API**: New Hono route(s) under `/api/dashboard/*` returning aggregated stats
- **DB**: Read-only aggregation queries against `usage_events`; no schema changes
- **Dependencies**: `usage_events` table must exist (`add-usage-event-tracking` must be deployed)
- **No breaking changes** to any existing API

## Non-Goals

- Real-time / live-updating metrics (polling is acceptable; websockets are out of scope)
- Date range filtering or custom time windows in the initial version
- Per-API-token breakdown
- Quota enforcement or billing logic
- Export to CSV / external analytics tools
