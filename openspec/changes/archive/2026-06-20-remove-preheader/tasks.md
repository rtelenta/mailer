## 1. Database

- [x] 1.1 Remove `preheader` column from `db/schema/templates.ts`
- [x] 1.2 Generate Drizzle migration with `npx drizzle-kit generate` and verify it contains `ALTER TABLE "templates" DROP COLUMN "preheader"`

## 2. Types

- [x] 2.1 Remove `preheader` from the `Template` type / inferred Drizzle type in `types/templates.ts`
- [x] 2.2 Remove `preheader` from all Zod schemas in `types/templates.ts`

## 3. Internal API (`lib/api/templates.ts`)

- [x] 3.1 Remove `preheader` from the create request Zod schema and the create DB insert
- [x] 3.2 Remove `preheader` from the update request Zod schema and the update DB update
- [x] 3.3 Remove `preheader` from SELECT result mapping (response shape)

## 4. Public API (`lib/api/v1.ts`)

- [x] 4.1 Remove `preheader` from the send request Zod schema
- [x] 4.2 Remove `preheader` from destructuring, override assignment, and defaults passed to `sendEmail`

## 5. Email Delivery (`lib/email/types.ts`)

- [x] 5.1 Remove `preheader?: string` from `EmailDefaults`

## 6. Template Editor Form (`features/templates/pages/TemplateEditorPage.tsx`)

- [x] 6.1 Remove `preheader` from the Zod form schema, `useForm` defaults, and mutation payload
- [x] 6.2 Remove the `<Field>` block for `preheader` (label, input, error)

## 7. Create Template Sheet (`features/templates/components/CreateTemplateSheet.tsx`)

- [x] 7.1 Remove `preheader` from the Zod form schema and mutation payload
- [x] 7.2 Remove the `<Field>` block for `preheader` (label, input, error)

## 8. Translations (`locales/en.json`)

- [x] 8.1 Remove `templateEditor.fields.preheader` key
- [x] 8.2 Remove `templates.create.fields.preheader` key (or equivalent nesting)
