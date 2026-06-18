## 1. Database

- [x] 1.1 Create `db/schema/templateShares.ts` with the `template_shares` Drizzle table definition (id, templateId FK → templates, userId FK → users, createdAt; unique index on templateId+userId)
- [x] 1.2 Re-export `templateShares` from `db/schema/index.ts`
- [x] 1.3 Generate a Drizzle migration for the new table (`bunx drizzle-kit generate`)

## 2. Types

- [x] 2.1 Add `TemplateCollaborator` interface and `AddShareInput` interface to `types/templates.ts`
- [x] 2.2 Add `role: "owner" | "collaborator"` field to `TemplateListItem` in `types/templates.ts`

## 3. API — Shares Sub-Resource

- [x] 3.1 Create `lib/api/templateShares.ts`: Hono router for `GET /:id/shares`, `POST /:id/shares`, `DELETE /:id/shares/:userId`; include owner-only guards and email-to-userId lookup
- [x] 3.2 Mount `templateSharesRouter` into `templatesRouter` in `lib/api/templates.ts` via `.route("/:id/shares", templateSharesRouter)`

## 4. API — Update Existing Endpoints

- [x] 4.1 Update `GET /api/templates` handler to UNION owned templates + shared templates; add `role` annotation to each result row
- [x] 4.2 Update `PATCH /api/templates/:id` to allow collaborators (check owner OR share row; return 403 if neither)
- [x] 4.3 Update `DELETE /api/templates/:id` to explicitly reject collaborators with 403

## 5. Client Hooks

- [x] 5.1 Create `features/templates/hooks/useTemplateShares.ts` (query `["templates", id, "shares"]`)
- [x] 5.2 Create `features/templates/hooks/useAddShare.ts` (mutation; invalidates shares query on success)
- [x] 5.3 Create `features/templates/hooks/useRemoveShare.ts` (mutation; invalidates shares query on success)

## 6. Share Management UI

- [x] 6.1 Create `features/templates/components/ShareTemplateSheet.tsx`: Sheet with collaborator list (with remove buttons for owner) and Add Collaborator form (email input + Add button + inline error)
- [x] 6.2 Add "Share" button to the editor header in `features/templates/pages/TemplateEditorPage.tsx`, passing template `id` and current user role to `ShareTemplateSheet`

## 7. Templates List UI

- [x] 7.1 Update `TemplateList.tsx` to render `<Badge variant="secondary">Shared</Badge>` next to the template name when `role === "collaborator"`

## 8. Localisation

- [x] 8.1 Add `templateSharing` namespace to `locales/en.json` (sheet title, add form labels, error messages, "Shared" badge label, collaborator list copy)
