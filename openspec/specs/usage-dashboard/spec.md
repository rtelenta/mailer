## Purpose

Provides authenticated users with an overview of their mailing activity through aggregated usage metrics, visualisations, and breakdowns — surfaced via a stats API and a dashboard UI.

## Requirements

### Requirement: Dashboard stats API
The system SHALL expose `GET /api/dashboard/stats` (authenticated) returning aggregated usage metrics for the authenticated user: total template count, total sends, total API calls, error rate, sends over the last 30 days bucketed by day, and sends broken down per template.

#### Scenario: Authenticated user fetches stats
- **WHEN** an authenticated user sends `GET /api/dashboard/stats`
- **THEN** the system returns 200 with a JSON body containing `templateCount`, `totalSends`, `totalApiCalls`, `errorRate`, `sendsOverTime` (array of 30 daily entries), and `sendsByTemplate` (array of per-template totals)

#### Scenario: Unauthenticated request is rejected
- **WHEN** an unauthenticated request is sent to `GET /api/dashboard/stats`
- **THEN** the system returns 401

#### Scenario: User with no usage events receives zero counts
- **WHEN** an authenticated user with no recorded usage events fetches stats
- **THEN** the response contains zero for all numeric fields and empty arrays for `sendsOverTime` and `sendsByTemplate`

### Requirement: Dashboard summary stat cards
The dashboard page SHALL display four summary stat cards visible on initial load: total template count, total send count, total API call count, and error rate (as a percentage).

#### Scenario: Stats render after load
- **WHEN** an authenticated user navigates to `/dashboard`
- **THEN** four stat cards are visible showing template count, total sends, API calls, and error rate

#### Scenario: Loading state is shown
- **WHEN** the stats API call is in flight
- **THEN** the dashboard displays skeleton or loading placeholders instead of empty values

### Requirement: Sends-over-time chart
The dashboard page SHALL display a line/area chart showing daily send volume and daily error count for the past 30 days.

#### Scenario: Chart renders with data
- **WHEN** the stats response contains `sendsOverTime` entries
- **THEN** an area chart renders with one data point per day, plotting both send count and error count

#### Scenario: Chart renders with no data
- **WHEN** `sendsOverTime` is empty
- **THEN** the chart area is shown with a zero-baseline and no data points (not an error state)

### Requirement: Sends-per-template table
The dashboard page SHALL display a table listing each template by name with its total send count, error count, and error rate percentage. Templates with `null` template_id (from deleted templates) SHALL be excluded.

#### Scenario: Table renders template rows
- **WHEN** the stats response contains `sendsByTemplate` entries
- **THEN** a table is shown with columns: Template Name, Sends, Errors, Error Rate

#### Scenario: Empty template list
- **WHEN** `sendsByTemplate` is empty
- **THEN** the table shows an empty-state message instead of a blank table body

### Requirement: API call vs. test-send breakdown
The dashboard page SHALL display a visual breakdown distinguishing API sends (`api_send_ok` + `api_send_error`) from test sends (`test_send_ok` + `test_send_error`) using the `totalApiCalls` field derived from the stats response.

#### Scenario: Breakdown shown alongside total sends
- **WHEN** stats are loaded and `totalSends` is greater than zero
- **THEN** the dashboard displays the API call count and the implied test-send count (totalSends - totalApiCalls) as distinct values
