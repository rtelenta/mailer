# Template Management — Delta Spec

Changes to the `template-management` capability introduced by `add-mjml-template-editor`.

---

## Changed Requirements

### FR-3 (new): Edit Action in List

Each row in the templates list MUST include an edit action (link or button) that navigates to `/templates/:id/edit`.

The edit action MUST appear alongside the existing delete action in the row actions column.

---

## New API Endpoint

### PATCH /api/templates/:id

See `mjml-template-editor` spec AR-1 for the full contract. This endpoint is owned by the `template-management` API module (`lib/api/templates.ts`) and is added in this change.

---

## Unchanged Requirements

All other requirements from the original `template-management` spec remain unchanged.
