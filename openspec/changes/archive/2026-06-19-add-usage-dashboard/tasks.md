## 1. Data Layer

- [x] 1.1 Create `lib/db/dashboard.ts` with aggregation queries: template count, total sends/errors by event type, daily buckets over last 30 days, and per-template totals (filtered to non-null template_id)
- [x] 1.2 Add `lib/api/dashboard.ts` Hono router with `GET /api/dashboard/stats` protected by `authMiddleware`, calling the query helpers and returning the typed response shape
- [x] 1.3 Mount `dashboardRouter` in `lib/api/index.ts` at `/api/dashboard`

## 2. Feature Module

- [x] 2.1 Create `features/dashboard/hooks/useDashboardStats.ts` — TanStack Query hook fetching `GET /api/dashboard/stats` with 60-second `staleTime`
- [x] 2.2 Create `features/dashboard/components/StatCards.tsx` — four cards: Template Count, Total Sends, API Calls, Error Rate
- [x] 2.3 Create `features/dashboard/components/SendsOverTimeChart.tsx` — shadcn `AreaChart` plotting daily sends and errors over the last 30 days
- [x] 2.4 Create `features/dashboard/components/SendsPerTemplateTable.tsx` — shadcn `Table` with columns Template Name / Sends / Errors / Error Rate; shows empty-state message when list is empty
- [x] 2.5 Create `features/dashboard/components/ApiVsTestBreakdown.tsx` — two stat values showing API send count vs. test-send count (totalSends − totalApiCalls)
- [x] 2.6 Create `features/dashboard/pages/DashboardPage.tsx` — composes all four components above; shows skeleton placeholders while `useDashboardStats` is loading

## 3. Routing

- [x] 3.1 Update `app/(authenticated)/dashboard/page.tsx` to import `DashboardPage` from `features/dashboard/pages/DashboardPage` instead of `features/shell/pages/DashboardPage`
- [x] 3.2 Delete `features/shell/pages/DashboardPage.tsx` (stub is replaced)

## 4. Localisation

- [x] 4.1 Add dashboard UI strings to `locales/en.json` under `dashboard.*` namespace (stat card labels, chart axis labels, table column headers, empty-state messages)
