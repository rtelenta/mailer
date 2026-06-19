## Context

The `/dashboard` route already exists as a stub (`features/shell/pages/DashboardPage.tsx` returns only a heading). The `usage_events` table is populated by the test-send and public API send paths. No aggregation queries exist yet. shadcn/ui ships Recharts-based chart components (`AreaChart`, `BarChart`) usable without additional installs.

## Goals / Non-Goals

**Goals:**
- Aggregation API returning summary stats and time-series data
- Dashboard page with stat cards, a sends-over-time chart, a sends-per-template table, and API vs. test-send call count display
- Error rate derived from event counts (errors / total sends)

**Non-Goals:**
- Date range filtering / custom time windows
- Real-time / live updates (a single page-load fetch is sufficient)
- Per-API-token breakdown
- Quota enforcement

## Decisions

**1. Single aggregated API endpoint: `GET /api/dashboard/stats`**

One round-trip is simpler than separate endpoints per widget. The response shape covers all four widgets. The payload is small (< 1 KB), so there is no streaming or pagination concern.

**2. Aggregation in SQL, not in JS**

`GROUP BY` in Postgres is far cheaper than fetching raw rows and reducing in JS. All aggregation (total counts, per-template counts, daily time-series) runs as Drizzle queries with `sql` template helpers.

**3. Time-series window: last 30 days, daily buckets**

Fixed window avoids UX complexity of date pickers in v1. Daily granularity is fine for the event volumes expected. The query uses `date_trunc('day', created_at)` to bucket events.

**4. Move `DashboardPage` from `features/shell` to `features/dashboard`**

The stub lives in `features/shell/pages/DashboardPage.tsx` because no dashboard feature existed. The real implementation belongs in `features/dashboard/`. The app route `app/(authenticated)/dashboard/page.tsx` keeps the same import target; only the source location changes.

**5. TanStack Query for client-side fetch**

Consistent with the project convention. The hook `useDashboardStats` wraps `GET /api/dashboard/stats` with a 60-second `staleTime` — the data is not real-time-sensitive. No mutation hooks are needed.

**6. shadcn chart primitives**

Use `ChartContainer`, `AreaChart`, and `BarChart` from `components/ui/chart` (Recharts-based shadcn wrappers). These are consistent with the existing component library and require no extra dependencies.

**7. Stat cards inline, not a separate component library**

The four summary cards (template count, total sends, API calls, error rate) are simple enough to render as inline card markup using shadcn `Card`. No abstracted `StatCard` component is needed.

**8. Sends-per-template: table, not chart**

A table better handles variable numbers of templates (a chart with 20+ series becomes unreadable). Uses shadcn `Table`. Columns: template name, send count, error count, error rate.

**9. `dashboardRouter` mounted at `/api/dashboard`**

Follows the existing pattern (`templatesRouter`, `tokensRouter`). Protected by the same `authMiddleware` used by other routes.

## Architecture

```
app/(authenticated)/dashboard/page.tsx
  └── features/dashboard/pages/DashboardPage.tsx
        ├── features/dashboard/hooks/useDashboardStats.ts   (TanStack Query)
        ├── features/dashboard/components/StatCards.tsx
        ├── features/dashboard/components/SendsOverTimeChart.tsx
        ├── features/dashboard/components/SendsPerTemplateTable.tsx
        └── features/dashboard/components/ApiVsTestBreakdown.tsx

lib/api/dashboard.ts       (Hono router: GET /api/dashboard/stats)
lib/db/dashboard.ts        (aggregation queries)
```

## API Shape

```ts
// GET /api/dashboard/stats
// Response:
{
  templateCount: number;
  totalSends: number;
  totalApiCalls: number;
  errorRate: number;                 // 0–1 (fraction)
  sendsOverTime: Array<{
    date: string;                    // "YYYY-MM-DD"
    sends: number;
    errors: number;
  }>;
  sendsByTemplate: Array<{
    templateId: string;
    templateName: string;
    sends: number;
    errors: number;
  }>;
}
```

## Risks / Trade-offs

- **Staleness**: 60-second `staleTime` means the dashboard may lag real activity. Acceptable for v1; a refresh button can be added later.
- **No index for `date_trunc` queries**: The existing `(user_id, created_at)` index on `usage_events` covers the time-series query sufficiently.
- **Template deletion**: `ON DELETE SET NULL` on `template_id` means deleted templates appear as `null` in `sendsByTemplate`. The query will group them as "Deleted template" or filter them out; the design chooses to filter (`WHERE template_id IS NOT NULL`).
