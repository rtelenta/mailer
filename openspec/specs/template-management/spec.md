# template-management

Persistent CRUD for email templates owned by an authenticated user: create, list (flat), and delete.

## Functional Requirements

### FR-1: Create Template
- The system MUST accept a create request with the following fields: `name` (required), `subject` (required), `fromName` (required), `replyTo` (optional), `mjml` (optional, max 500,000 chars)
- When `mjml` is omitted, the system MUST store an empty string `""` for the field
- The system MUST validate input against a Zod schema before persisting; invalid input MUST return HTTP 422 with a structured error body
- The system MUST generate a UUID v7 for the template `id` — the caller MUST NOT supply an ID
- The system MUST associate the new template with the authenticated user's ID
- On success, the system MUST return HTTP 201 with the created template record (id, name, subject, fromName, replyTo, createdAt)

### FR-2: List Templates
- The system MUST return all templates where the authenticated user is the owner OR an added collaborator
- The system MUST return an empty array when the user has no owned or shared templates
- The list MUST be ordered by `createdAt` descending (newest first) across both owned and shared templates
- The response MUST conform to `{ templates: TemplateListItem[] }`
- Each item MUST include `role: "owner" | "collaborator"` indicating the requesting user's relationship to the template

### FR-3: Delete Template
- The system MUST delete the template with the given `id` if it exists and the authenticated user is the **owner**
- The system MUST return HTTP 204 with no response body on success
- The system MUST return HTTP 403 if the authenticated user is a collaborator (not the owner)
- The system MUST return HTTP 404 if the template does not exist or does not belong to/is not shared with the authenticated user

### FR-4: Authentication Guard
- All endpoints MUST require an authenticated better-auth session
- Unauthenticated requests MUST receive HTTP 401

### FR-6: Edit Action in List
- Each row in the templates list MUST include an edit action (link or button) that navigates to `/templates/:id/edit`
- The edit action MUST appear alongside the delete action in the row actions column

### FR-7: Update Template
- `PATCH /api/templates/:id` MUST accept a partial body of mutable fields (any subset of: `name`, `mjml`, `subject`, `fromName`, `replyTo`)
- `PATCH /api/templates/:id` MUST be accessible by the template **owner OR any collaborator**
- The endpoint MUST return `401` if unauthenticated, `403` if the authenticated user has no relationship to the template (neither owner nor collaborator), `404` if not found, `422` on validation failure
- The endpoint MUST return the full updated `TemplateRecord` on success (`200`) and update `updatedAt` to the current timestamp
- See `mjml-template-editor` spec AR-1 for the full field-level contract

### FR-5: MJML size guard
- The `mjml` field MUST be rejected with HTTP 422 if it exceeds 500,000 characters

## Interface Contract

### API Endpoints

```
POST   /api/templates
GET    /api/templates
GET    /api/templates/:id
PATCH  /api/templates/:id
DELETE /api/templates/:id
```

### Request body — POST /api/templates

```ts
interface CreateTemplateInput {
  name: string;          // non-empty, max 255 chars
  mjml?: string;         // optional, max 500,000 chars; defaults to "" when absent
  subject: string;       // non-empty, max 998 chars (RFC 5322 subject limit)
  fromName: string;      // non-empty, max 255 chars
  replyTo?: string;      // optional valid email address
}
```

### Response shapes

```ts
// POST /api/templates → 201
interface TemplateRecord {
  id: string;
  name: string;
  subject: string;
  fromName: string;
  replyTo: string | null;
  createdAt: string;  // ISO 8601
}

// GET /api/templates → 200
interface TemplatesListResponse {
  templates: TemplateListItem[];
}

interface TemplateListItem {
  id: string;
  name: string;
  subject: string;
  fromName: string;
  replyTo: string | null;
  createdAt: string;
  role: "owner" | "collaborator";
}

// DELETE /api/templates/:id → 204 (no body)
```

## UI Requirements

### UR-1: Templates List Page (`/templates`)
- The page MUST render a table listing all templates owned by the authenticated user
- The table MUST display at minimum: `name`, `subject`, `fromName`, `createdAt`
- Each row MUST include a delete action; triggering it MUST prompt the user for confirmation before sending the delete request
- The list MUST show an empty state message when no templates exist
- All UI text MUST be sourced from `locales/en.json` via the `t()` utility

### UR-2: Create Template
- The page MUST include a trigger (button) to open a Sheet component containing the create-template form
- The form MUST include fields for: name, subject, from-name, MJML source (textarea, optional), reply-to
- The MJML source textarea MUST NOT be a required field; submitting without it MUST be allowed
- The form MUST use react-hook-form with a Zod schema as the single source of validation truth
- Required fields MUST show inline validation errors
- On successful submission, the Sheet MUST close and the user MUST be redirected to `/templates/:id/edit` for the newly created template
- The submit button MUST be disabled and show a loading state while the request is in flight

### UR-3: Delete Confirmation
- Triggering delete on a row MUST show a confirmation dialog (shadcn `AlertDialog`) before the request is sent
- The confirmation MUST display the template name so the user knows what they are deleting
- On confirmation, the row MUST be removed from the list after the server responds successfully

## Non-Functional Requirements

- All API handlers are server-side only; no Drizzle imports in Client Components
- `userId` is read exclusively from the better-auth session on the server — it MUST NOT be passed in request bodies
- The `templatesRouter` Hono module MUST be mounted into the existing `lib/api/index.ts` aggregator
- Client-side data fetching MUST use TanStack Query hooks (`useTemplates`, `useTemplate`, `useCreateTemplate`, `useUpdateTemplate`, `useDeleteTemplate`)
- `useTemplates` hook response type MUST include `role: "owner" | "collaborator"` on each item
- All env vars referenced in new code MUST be re-exported from `lib/constants.ts`
