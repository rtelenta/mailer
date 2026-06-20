# Proposal: optional-mjml-on-create

## What

Make the MJML Source field optional when creating a new template. Users can create a template with just the metadata fields (name, subject, from name, reply-to) and add or paste MJML later in the editor.

## Why

Currently the create-template sheet requires a full MJML body before the template can be saved. This creates friction for users who want to first set up the template's identity (name, subject, sender) and write the MJML separately — or paste it in after opening the editor. Making MJML optional at create time matches the natural workflow: create the shell, then author the content.

## Scope

- `lib/api/templates.ts` — make `mjml` optional in `createTemplateSchema`; default to `""` when not supplied
- `types/templates.ts` — make `mjml` optional in `CreateTemplateInput`
- `features/templates/components/CreateTemplateSheet.tsx` — make `mjml` optional in the Zod form schema; remove `min(1)` constraint; allow empty submission

## Out of Scope

- No database schema change — the column is already `NOT NULL`; an empty string satisfies the constraint
- No change to the update (`PATCH`) path — MJML is already optional there
- No change to what the editor shows when opening a template with empty MJML — it already renders an empty code pane
