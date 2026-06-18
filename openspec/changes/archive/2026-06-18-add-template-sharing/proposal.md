# add-template-sharing

## What

Enable a template owner to share their template with other registered users for collaborative editing. Introduce a two-tier permission model (owner / collaborator) that governs who can edit or delete a shared template.

## Why

Templates are currently private to the user who created them. Teams working together need a way to co-author MJML templates without duplicating them. Sharing by email address (the user's existing identity) is the lowest-friction path — no invite codes, no separate workspace concept.

## Scope

### In

- A `template_shares` join table: `(template_id, user_id, role)` where role is `collaborator`
- `GET /api/templates/:id/shares` — list current collaborators (owner only)
- `POST /api/templates/:id/shares` — add a collaborator by email (owner only)
- `DELETE /api/templates/:id/shares/:userId` — remove a collaborator (owner only)
- `GET /api/templates` returns shared templates alongside owned templates, with a `role` field (`owner` | `collaborator`) on each item
- Collaborators can read and PATCH shared templates; they cannot DELETE them
- `DELETE /api/templates/:id` restricted to owner
- UI: share management panel on the template editor page — list current collaborators, add by email, remove
- UI: templates list distinguishes shared-with-me templates (e.g. "Shared" badge)

### Out

- Team/workspace-level sharing
- Role levels beyond owner/collaborator (e.g. viewer-only)
- Sharing by link
- Notifications or email invitations
- Transferring ownership

## Dependencies

- `add-template-management` — templates table, CRUD endpoints, `TemplateRecord` type
