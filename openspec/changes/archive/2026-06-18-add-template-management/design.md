## Context

The app shell establishes the authenticated layout with a `/templates` route already in the nav. This change populates that route with a working templates list page and wires up the full CRUD surface (create, list, delete) via Hono endpoints backed by a new Drizzle `templates` table.

The email-delivery service already defines `EmailDefaults` (subject, fromName, replyTo, preheader) and expects callers to supply an MJML string — template management gives those callers a persistent store to pull from.

No new packages are required. All dependencies (Drizzle, Hono, shadcn/ui, TanStack Query, react-hook-form, zod) are already installed.

## Goals / Non-Goals

**Goals:**
- Persist template records (name, MJML source, subject, from-name, reply-to, preheader) per user
- Expose `POST /api/templates`, `GET /api/templates`, `DELETE /api/templates/:id` from the existing Hono app
- Render a flat templates list at `/templates` with a create-template form and per-row delete action

**Non-Goals:**
- Template editing (separate change)
- Preview/render of MJML in the browser
- Versioning, folders, tags, or sharing
- Pagination (flat list is fine for MVP)

## Decisions

### Ownership: user-scoped via `userId` FK

Every template row carries a `userId` foreign key referencing better-auth's `user` table. All read and delete queries filter by `userId` from the authenticated session. This is the simplest model given single-user scopes and avoids an org/team layer that isn't needed yet.

Alternatives considered: no ownership (all users see all templates) — rejected because templates will hold user-authored MJML and should be private by default.

### API route placement: new `templates.ts` Hono sub-app

The existing `lib/api/index.ts` is a thin aggregator. A new `lib/api/templates.ts` module exports a `templatesRouter` (a Hono instance) that is `.route()`-mounted onto the main app. This follows the pattern established by `auth.ts` and keeps each domain isolated.

### Schema location: `db/schema/templates.ts`

Consistent with the convention of one file per table in `db/schema/`. The migration is generated via `drizzle-kit generate` as part of the implementation task.

### Drizzle schema shape

```ts
// db/schema/templates.ts
export const templates = pgTable("templates", {
  id:         text("id").primaryKey(),                     // UUID v7, app-generated
  userId:     text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name:       text("name").notNull(),
  mjml:       text("mjml").notNull(),
  subject:    text("subject").notNull(),
  fromName:   text("from_name").notNull(),
  replyTo:    text("reply_to"),
  preheader:  text("preheader"),
  createdAt:  timestamp("created_at").notNull().defaultNow(),
  updatedAt:  timestamp("updated_at").notNull().defaultNow(),
});
```

All fields use `text` (no varchar length limit — MJML can be large). `replyTo` and `preheader` are nullable because they are optional in the email-delivery interface.

### Hono route signatures

```ts
POST   /api/templates          → 201 { id, name, subject, fromName, replyTo, preheader, createdAt }
GET    /api/templates          → 200 { templates: TemplateListItem[] }
DELETE /api/templates/:id      → 204 (no body)
```

Auth middleware on the Hono router validates the better-auth session before any handler runs. A 401 is returned if the session is absent. A 404 is returned on delete if the template doesn't exist or belongs to a different user.

### UI: shadcn Table for the list, Sheet for the create form

The list page uses shadcn's `Table` component — it fits the flat list pattern with name, subject, from-name columns and a delete action per row. A `Sheet` (slide-over) holds the create form to avoid a full-page navigation.

Alternatives considered: a `Dialog` modal — rejected because the MJML textarea benefits from more vertical space that a Sheet provides.

### Page structure

```
app/(authenticated)/templates/page.tsx   → thin shell, renders <TemplatesPage />
features/templates/pages/TemplatesPage.tsx
features/templates/components/TemplateList.tsx
features/templates/components/CreateTemplateSheet.tsx
features/templates/hooks/useTemplates.ts
features/templates/hooks/useCreateTemplate.ts
features/templates/hooks/useDeleteTemplate.ts
```

## Risks / Trade-offs

- **MJML stored as raw text**: No size limit enforced at the DB layer. Large templates will inflate row size. Mitigation: add a max-length check in the Zod schema (e.g. 500 KB) to prevent accidental bloat.
- **No optimistic delete**: Delete is confirmed via a server round-trip and cache invalidation; a brief flicker is acceptable at MVP scale.
- **`updatedAt` not auto-updated on writes**: Drizzle doesn't auto-update `updatedAt` on update — since editing isn't in scope, this is fine for now but should be noted for the edit change.

## Migration Plan

1. Add `db/schema/templates.ts` and register it in `db/schema/index.ts`
2. Run `bunx drizzle-kit generate` to produce the migration file
3. Run `bunx drizzle-kit migrate` (or apply via the existing migration runner) on deploy
4. Rollback: `DROP TABLE templates` — no data dependency from other tables (users cascade-deletes rows)

## Open Questions

- None blocking implementation.
