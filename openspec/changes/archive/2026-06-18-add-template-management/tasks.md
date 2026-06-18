## 1. Database Schema

- [x] 1.1 Create `db/schema/templates.ts` with the `templates` pgTable (id as UUID v7 text PK, userId FK → users.id with cascade delete, name, mjml, subject, fromName, replyTo nullable, preheader nullable, createdAt, updatedAt)
- [x] 1.2 Export `templates` from `db/schema/index.ts`
- [x] 1.3 Run `bunx drizzle-kit generate` to produce the migration file in `db/migrations/`
- [x] 1.4 Run `bunx drizzle-kit migrate` to apply the migration to the local dev database

## 2. API — Hono Router

- [x] 2.1 Create `lib/api/templates.ts` exporting `templatesRouter` — a Hono instance with better-auth session middleware applied
- [x] 2.2 Implement `GET /api/templates` — query all templates for the authenticated userId, ordered by createdAt desc, return `{ templates: TemplateListItem[] }`
- [x] 2.3 Implement `POST /api/templates` — validate body with Zod (name, mjml ≤500k chars, subject, fromName, optional replyTo/preheader), generate UUID v7 id, insert row, return 201 with created record
- [x] 2.4 Implement `DELETE /api/templates/:id` — find template by id+userId, return 404 if not found, delete and return 204
- [x] 2.5 Mount `templatesRouter` into `lib/api/index.ts` via `.route("/api", templatesRouter)`

## 3. Types

- [x] 3.1 Create `types/templates.ts` exporting `TemplateRecord`, `TemplateListItem`, `CreateTemplateInput` interfaces matching the interface contract in the spec

## 4. TanStack Query Hooks

- [x] 4.1 Create `features/templates/hooks/useTemplates.ts` — `useQuery` fetching `GET /api/templates`, returns `TemplateListItem[]`
- [x] 4.2 Create `features/templates/hooks/useCreateTemplate.ts` — `useMutation` posting to `POST /api/templates`, invalidates the templates query on success
- [x] 4.3 Create `features/templates/hooks/useDeleteTemplate.ts` — `useMutation` sending `DELETE /api/templates/:id`, invalidates the templates query on success

## 5. UI Components

- [x] 5.1 Create `features/templates/components/TemplateList.tsx` — shadcn `Table` rendering name, subject, fromName, createdAt columns; empty state when list is empty; delete button per row
- [x] 5.2 Create `features/templates/components/DeleteTemplateDialog.tsx` — shadcn `AlertDialog` showing the template name, calls `useDeleteTemplate` on confirm
- [x] 5.3 Create `features/templates/components/CreateTemplateSheet.tsx` — shadcn `Sheet` containing the create form (react-hook-form + Zod); fields: name, subject, fromName, mjml textarea, replyTo, preheader; submit button with loading state; closes and invalidates list on success
- [x] 5.4 Create `features/templates/pages/TemplatesPage.tsx` — composes TemplateList + CreateTemplateSheet trigger; fetches via `useTemplates`

## 6. Routing

- [x] 6.1 Create `app/(authenticated)/templates/page.tsx` as a thin shell rendering `<TemplatesPage />`

## 7. Locale Strings

- [x] 7.1 Add all required UI text keys to `locales/en.json` under a `templates` namespace (page title, empty state, column headers, create button label, sheet title, field labels, delete confirmation prompt and button labels, success/error messages)
