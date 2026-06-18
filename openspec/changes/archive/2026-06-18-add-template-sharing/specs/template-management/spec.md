# template-management — delta for add-template-sharing

Changes to the existing `template-management` spec introduced by the `add-template-sharing` change.

## MODIFIED: FR-2: List Templates

Replace the existing FR-2 with:

- The system MUST return all templates where the authenticated user is the owner OR an added collaborator
- The system MUST return an empty array when the user has no owned or shared templates
- The list MUST be ordered by `createdAt` descending (newest first) across both owned and shared templates
- The response MUST conform to `{ templates: TemplateListItem[] }`
- Each item MUST include `role: "owner" | "collaborator"` indicating the requesting user's relationship to the template

## MODIFIED: FR-3: Delete Template

Replace the existing FR-3 with:

- The system MUST delete the template with the given `id` if it exists and the authenticated user is the **owner**
- The system MUST return HTTP 204 with no response body on success
- The system MUST return HTTP 403 if the authenticated user is a collaborator (not the owner)
- The system MUST return HTTP 404 if the template does not exist or does not belong to/is not shared with the authenticated user

## MODIFIED: FR-7: Update Template

Replace the existing FR-7 `PATCH /api/templates/:id` authorization rule:

- `PATCH /api/templates/:id` MUST be accessible by the template **owner OR any collaborator**
- The endpoint MUST return `403` if the authenticated user has no relationship to the template (neither owner nor collaborator)
- All other validation rules (401, 404, 422, response shape) remain unchanged

## MODIFIED: Interface Contract — TemplateListItem

Add `role` to the `TemplateListItem` response shape:

```ts
interface TemplateListItem {
  id: string;
  name: string;
  subject: string;
  fromName: string;
  replyTo: string | null;
  preheader: string | null;
  createdAt: string;  // ISO 8601
  role: "owner" | "collaborator"; // NEW
}
```

## MODIFIED: Non-Functional Requirements (addition)

Add to the existing NFRs:

- `useTemplates` hook response type MUST be updated to include `role` on each item
