## 1. API (`lib/api/templates.ts`)

- [x] 1.1 Change `mjml` in `createTemplateSchema` from `z.string().min(1).max(500_000)` to `z.string().max(500_000).optional()`
- [x] 1.2 In the POST handler, replace `const { name, mjml, ... } = parsed.data` with `const { name, ... } = parsed.data; const mjml = parsed.data.mjml ?? ""`

## 2. Types (`types/templates.ts`)

- [x] 2.1 Make `mjml` optional in `CreateTemplateInput`: change `mjml: string` to `mjml?: string`

## 3. Create Form (`features/templates/components/CreateTemplateSheet.tsx`)

- [x] 3.1 Change `mjml` in the form Zod schema from `z.string().min(1).max(500_000)` to `z.string().max(500_000).optional()`
