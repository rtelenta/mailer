## Why

Email templates are the core asset of this platform. Users need a way to create, browse, and delete templates before they can be used for delivery. Without template management, the email delivery capability has no templates to send.

## What Changes

- New Drizzle schema: `templates` table with UUID v7 PK, owner user ID, name, MJML source, subject, from-name, reply-to, preheader, and timestamps
- New Hono endpoints: `POST /api/templates`, `GET /api/templates`, `DELETE /api/templates/:id`
- New UI: templates list page and create-template form in the templates section of the app shell
- Zod schemas for request validation; TanStack Query hooks for client-side data fetching

## Capabilities

### New Capabilities

- `template-management`: CRUD operations for email templates owned by a user — create, list (flat), and delete. Each template stores name, MJML source, subject, from-name, reply-to, and preheader.

### Modified Capabilities

- `app-shell`: Templates nav item links to the new templates list page (routing change, no spec-level requirement change)

## Impact

- **DB schema**: New `templates` table, new Drizzle migration
- **API**: Three new Hono routes under `/api/templates`
- **UI**: New page at `/templates`, new feature domain `features/templates/`
- **Dependencies**: No new packages required (Drizzle, Hono, shadcn/ui, TanStack Query already in the stack)
- **No env vars added**
- **No impact on the public send API**

## Non-goals

- Template versioning, folders, or tags
- Template preview or rendering in the UI
- Editing existing templates
- Sharing templates across users
- Pagination (flat list is sufficient for MVP)
