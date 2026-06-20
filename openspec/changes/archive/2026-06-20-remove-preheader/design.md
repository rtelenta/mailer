# Design: remove-preheader

## Goals

- Remove every trace of `preheader` from the codebase: database, types, API, email layer, forms, translations
- Leave no dead-code remnants

## Non-Goals

- No replacement UI for preview text
- No data migration — existing `preheader` column values are discarded on column drop

---

## Changes by Layer

### 1. Database Schema (`db/schema/templates.ts`)

Remove the `preheader: text("preheader")` column from the `templates` table definition.

### 2. Drizzle Migration

Generate a new migration using `npx drizzle-kit generate`. The resulting SQL will contain:

```sql
ALTER TABLE "templates" DROP COLUMN "preheader";
```

The migration file lands in `db/migrations/` and the corresponding snapshot in `db/migrations/meta/`. Both are committed.

### 3. Template Types (`types/templates.ts`)

Remove `preheader` from:
- The `Template` base type (or inferred Drizzle type)
- All Zod schemas used for create/update validation

### 4. Internal API (`lib/api/templates.ts`)

Remove `preheader` from:
- The create request Zod schema
- The update request Zod schema
- The destructuring in the create handler (`{ name, mjml, subject, fromName, replyTo, preheader }`)
- The `preheader` field in the DB insert/update calls
- The `preheader` field in SELECT result mapping

### 5. Public API v1 (`lib/api/v1.ts`)

Remove `preheader` from:
- The send request Zod schema (`z.string().optional()`)
- The destructured fields (`const { ..., preheader } = parsed.data`)
- The override assignment (`if (preheader !== undefined) overrides.preheader = preheader`)
- The `defaults` object passed to `sendEmail` (where `template.preheader ?? undefined` is used)

### 6. Email Delivery Types (`lib/email/types.ts`)

Remove the optional `preheader?: string` field from `EmailDefaults`.

`ProviderSendParams` does not include `preheader` (it was never forwarded to the provider), so no change there.

### 7. Email Orchestrator (`lib/email/index.ts`)

No change needed — `preheader` was never forwarded to `provider.send()`. Removing it from `EmailDefaults` is sufficient.

### 8. Template Editor (`features/templates/pages/TemplateEditorPage.tsx`)

Remove from the edit form:
- `preheader` from the Zod form schema
- `preheader` from the `useForm` defaults
- `preheader` from the `onSubmit` mutation payload
- The entire `<Field>` block for `preheader` (label, input, error)

### 9. Create Template Sheet (`features/templates/components/CreateTemplateSheet.tsx`)

Remove from the create form:
- `preheader` from the Zod form schema
- `preheader` from the mutation payload
- The entire `<Field>` block for `preheader` (label, input, error)

### 10. Translations (`locales/en.json`)

Remove:
- `templateEditor.fields.preheader` key
- `templates.create.fields.preheader` key (or equivalent nesting)

---

## Migration Order at Runtime

1. Deploy code (which no longer reads/writes `preheader`)
2. Run `npx drizzle-kit migrate` to drop the column

Because existing code already handles `preheader` as nullable/optional, the column can be dropped after deploy without a read-before-write window.
