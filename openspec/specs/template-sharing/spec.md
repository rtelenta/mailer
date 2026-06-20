# template-sharing

Collaborative template editing: an owner can invite other registered users by email to be collaborators on a template. Collaborators can view and edit but not delete shared templates.

## Functional Requirements

### FR-1: Share a Template
- The system MUST allow the template owner to add a collaborator by their email address via `POST /api/templates/:id/shares`
- The system MUST look up the target user by email in the user table; if not found, MUST return HTTP 422 with `"No user with that email address"`
- The system MUST reject sharing with the owner's own email with HTTP 422 and `"Cannot share with yourself"`
- The system MUST reject duplicate shares with HTTP 409 and `"Already shared with this user"`
- Only the owner may add collaborators; non-owners MUST receive HTTP 403

### FR-2: List Collaborators
- `GET /api/templates/:id/shares` MUST return the current list of collaborators for a template
- Only the owner may list collaborators; non-owners MUST receive HTTP 403
- The response MUST include each collaborator's `userId`, `email`, and `name`

### FR-3: Remove a Collaborator
- `DELETE /api/templates/:id/shares/:userId` MUST remove the collaborator record
- Only the owner may remove collaborators; non-owners MUST receive HTTP 403
- If the share record does not exist, MUST return HTTP 404
- On success, MUST return HTTP 204 with no body

### FR-4: Collaborator Permissions
- Collaborators MUST be able to read (`GET /api/templates/:id`) and edit (`PATCH /api/templates/:id`) shared templates
- Collaborators MUST NOT be able to delete (`DELETE /api/templates/:id`) shared templates; the system MUST return HTTP 403
- All share-management endpoints (`/shares`) are owner-only

### FR-5: Shared Templates Appear in the List
- `GET /api/templates` MUST return templates where the authenticated user is either owner or collaborator
- Each item in the response MUST include `role: "owner" | "collaborator"`
- The list MUST remain ordered by `createdAt` descending across both sets

### FR-6: Share Management UI
- The template editor MUST include a "Share" trigger that opens a Sheet panel
- The panel MUST list current collaborators (name + email) with a remove button per row
- The panel MUST include an "Add collaborator" form with an email input and an Add button
- The Add button MUST be disabled while the request is in flight
- On add success the collaborator list MUST refresh; on error the inline error from the API MUST be shown
- Only the owner sees the remove buttons and the Add form; collaborators see the panel in read-only mode (list only)

### FR-7: Shared Badge in Templates List
- Templates where `role === "collaborator"` MUST show a "Shared" badge next to the template name in the list
- The badge conveys that the template was shared with the current user (not created by them)

## Interface Contract

### API Endpoints

```
GET    /api/templates/:id/shares
POST   /api/templates/:id/shares
DELETE /api/templates/:id/shares/:userId
```

### Request body — POST /api/templates/:id/shares

```ts
interface AddShareInput {
  email: string; // valid email address
}
```

### Response shapes

```ts
// GET /api/templates/:id/shares → 200
interface TemplateSharesResponse {
  shares: TemplateCollaborator[];
}

interface TemplateCollaborator {
  userId: string;
  email: string;
  name: string;
}

// POST /api/templates/:id/shares → 201
interface TemplateCollaborator {
  userId: string;
  email: string;
  name: string;
}

// DELETE /api/templates/:id/shares/:userId → 204 (no body)

// GET /api/templates (updated shape)
interface TemplateListItem {
  id: string;
  name: string;
  subject: string;
  fromName: string;
  replyTo: string | null;
  createdAt: string; // ISO 8601
  role: "owner" | "collaborator"; // NEW
}
```

### Database — `template_shares` table

| Column        | Type      | Constraints                                     |
|---------------|-----------|-------------------------------------------------|
| `id`          | uuid      | PK, UUID v7 default                             |
| `template_id` | uuid      | NOT NULL, FK → `templates.id` ON DELETE CASCADE |
| `user_id`     | uuid      | NOT NULL, FK → `users.id` ON DELETE CASCADE     |
| `created_at`  | timestamptz | NOT NULL, default now()                       |

Unique index on `(template_id, user_id)`.

### TanStack Query Hooks

- `useTemplateShares(id)` — query `["templates", id, "shares"]`
- `useAddShare(id)` — mutation; invalidates `["templates", id, "shares"]` on success
- `useRemoveShare(id)` — mutation; invalidates `["templates", id, "shares"]` on success

## UI Requirements

### UR-1: Share Button in Editor Header
- A "Share" button MUST appear in the editor header alongside the Save button
- Clicking it opens `ShareTemplateSheet`

### UR-2: ShareTemplateSheet
- Title: "Share Template"
- Section: collaborators list — name + email per row; owner sees a remove (trash) icon button per row
- Section: Add collaborator — `FieldGroup` + `Field` with email input; "Add" button with loading state
- Inline error display below the email input when the API rejects the email
- Collaborators viewing the sheet see only the list (no Add form, no remove buttons)

### UR-3: Shared Badge
- `<Badge variant="secondary">Shared</Badge>` appears next to the template name in the `TemplateList` table when `role === "collaborator"`

## Non-Functional Requirements

- `templateSharesRouter` (Hono) mounted into `templatesRouter` via `.route("/:id/shares", templateSharesRouter)`
- Drizzle migration is additive (new table + index); no data backfill needed
- User lookup by email queries the better-auth `user` table; do NOT pass userId in request bodies
- All new UI text sourced from `locales/en.json` under `templateSharing` namespace
