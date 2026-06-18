## Context

Templates are currently private to their creator. The `templates` table has a `userId` column that gates all reads, writes, and deletes. No sharing mechanism exists. This change adds a join table and a permission model so owners can invite collaborators by email.

## Goals / Non-Goals

**Goals:**
- `template_shares` join table tracks (template_id, user_id) — all added users are collaborators
- `GET /api/templates` returns owned and shared templates in a single list, each item annotated with `role: "owner" | "collaborator"`
- `PATCH /api/templates/:id` allows both owners and collaborators
- `DELETE /api/templates/:id` restricted to owner only (already is, just explicitly enforced)
- Shares sub-resource: list, add by email, remove — owner-only operations
- Share management UI in the template editor; "Shared" badge in the templates list

**Non-Goals:**
- Viewer-only role, team/workspace sharing, sharing by link, ownership transfer, notifications

## Decisions

### 1. `template_shares` as a simple join table (no role column yet)

All non-owners are collaborators. Adding a `role` column now for forward-compatibility was considered, but YAGNI applies — a future change can add the column via migration. For now the row's existence implies `collaborator`.

**Alternative considered:** embed role as a nullable column on `templates` (single-table inheritance). Rejected — doesn't scale to multiple collaborators per template.

**Drizzle schema:**
```ts
// db/schema/templateShares.ts
export const templateShares = pgTable(
  "template_shares",
  {
    id: uuid("id").$defaultFn(() => uuidv7()).primaryKey(),
    templateId: uuid("template_id")
      .notNull()
      .references(() => templates.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("template_shares_template_user_idx").on(t.templateId, t.userId)]
);
```

The unique index prevents duplicate shares. `ON DELETE CASCADE` on both FKs keeps the table clean without application-level cleanup.

### 2. Lookup collaborator by email, store by userId

`POST /api/templates/:id/shares` accepts `{ email: string }`. The handler queries the better-auth `user` table (`db/schema/auth.ts`) to resolve the email to a userId before inserting into `template_shares`.

**Why not store email directly:** userId is the stable identity; emails can change.

**Edge cases:**
- Email not found → 422 with `"No user with that email address"`
- Email is the owner's own email → 422 with `"Cannot share with yourself"`
- Already a collaborator → 409 `"Already shared with this user"`

### 3. `GET /api/templates` returns both owned and shared with a `role` annotation

```ts
// Pseudo-SQL: UNION of owned templates + shared templates
SELECT t.*, 'owner' AS role
FROM templates t WHERE t.user_id = :userId
UNION ALL
SELECT t.*, 'collaborator' AS role
FROM templates t
JOIN template_shares ts ON ts.template_id = t.id
WHERE ts.user_id = :userId
ORDER BY created_at DESC
```

`TemplateListItem` gains `role: "owner" | "collaborator"`. The response shape stays `{ templates: TemplateListItem[] }`.

### 4. Shares sub-router mounted under `/api/templates`

New Hono router `lib/api/templateShares.ts` handles:

```
GET    /api/templates/:id/shares           → list collaborators (owner only)
POST   /api/templates/:id/shares           → add by email (owner only)
DELETE /api/templates/:id/shares/:userId   → remove collaborator (owner only)
```

The existing `templatesRouter` delegates to `templateSharesRouter` via `.route("/:id/shares", templateSharesRouter)`.

### 5. `PATCH` and `DELETE` permission split

- `PATCH /api/templates/:id`: check owner OR collaborator share row → allow
- `DELETE /api/templates/:id`: check owner only → 403 for collaborators

Both checks happen in the handler by first fetching the template and comparing `userId`, then (for PATCH) falling back to a share lookup.

### 6. Share management UI: Sheet in the editor header

A `ShareTemplateSheet` component (Sheet with a trigger button "Share") opens from the editor page header. Inside:
- List of current collaborators with a remove button (owner sees remove; collaborators see a read-only list)
- An "Add collaborator" form: email input + Add button
- `useTemplateShares(id)` / `useAddShare(id)` / `useRemoveShare(id)` TanStack Query hooks

The templates list adds a `<Badge variant="secondary">Shared</Badge>` next to the template name when `role === "collaborator"`.

## Risks / Trade-offs

- **Email lookup leaks user existence** → acceptable: the SSO is internal, users are colleagues, not public accounts. Returning `"No user with that email"` is fine in this context.
- **Collaborator can PATCH fields the owner cares about** (e.g. name, subject) → by design; this is collaborative editing. Audit trail is out of scope.
- **No notifications** → collaborators won't know they've been added until they log in and see the template. Acceptable for v1.

## Migration Plan

1. Add `db/migrations/<timestamp>_add_template_shares.sql` via `drizzle-kit generate`
2. The migration is additive (new table + index) — zero downtime, no data backfill needed
3. Rollback: drop `template_shares` table and remove application code

## Open Questions

- None blocking. Email-lookup user-existence leak is acceptable per context.
