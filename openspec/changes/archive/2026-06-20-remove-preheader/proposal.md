# Proposal: remove-preheader

## What

Remove the `preheader` field from all layers of the application: the database schema, the template create/edit forms, the API request/response bodies, the email delivery types, and the translation strings.

## Why

The `preheader` field adds surface area without delivering value. Preview text is an email-client rendering hint that can be encoded directly in the MJML template body (via `<mj-preview>`) by whoever authors the template. Surfacing it as a separate form field duplicates that capability, adds schema noise, and creates a field that is frequently left empty. Removing it simplifies the data model, the forms, and the API contract.

## Scope

- `db/schema/templates.ts` — drop the `preheader` column
- New Drizzle migration — `ALTER TABLE templates DROP COLUMN preheader`
- `types/templates.ts` — remove from the `Template` type and all Zod schemas
- `lib/api/templates.ts` — remove from create/update request parsing and DB inserts/updates
- `lib/api/v1.ts` — remove from public API request/response schemas
- `lib/email/types.ts` — remove the optional `preheader` field from `EmailDefaults`
- `lib/email/index.ts` — stop forwarding `preheader` to the provider
- `lib/email/resend.ts` — remove `preheader` from `ProviderSendParams` handling (if present)
- `features/templates/pages/TemplateEditorPage.tsx` — remove field from edit form
- `features/templates/components/CreateTemplateSheet.tsx` — remove field from create form
- `locales/en.json` — remove all `preheader`-related translation keys

## Out of Scope

- No replacement UX. Teams that need preview text can embed `<mj-preview>` directly in MJML.
- No migration of existing preheader data — values are discarded on column drop.
