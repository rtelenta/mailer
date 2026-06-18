## 1. Dependencies

- [x] 1.1 Install `mjml-browser` and `handlebars` packages via `bun add`

## 2. API Layer

- [x] 2.1 Add `GET /api/templates/:id` route to `lib/api/templates.ts` — returns full `TemplateRecord` (including `mjml`); 401 if unauth, 404 if not found or belongs to another user
- [x] 2.2 Add `updateTemplateSchema` (partial of createTemplateSchema, all fields optional) and `PATCH /api/templates/:id` route to `lib/api/templates.ts` — validates body, updates record, sets `updatedAt`, returns updated `TemplateRecord`; 401/403/404/422 as per spec AR-1

## 3. Types

- [x] 3.1 Add `UpdateTemplateInput` interface to `types/templates.ts`

## 4. Data Hooks

- [x] 4.1 Create `features/templates/hooks/useTemplate.ts` — `useQuery` fetching `GET /api/templates/:id`, queryKey `["templates", id]`
- [x] 4.2 Create `features/templates/hooks/useUpdateTemplate.ts` — `useMutation` calling `PATCH /api/templates/:id`, invalidates `["templates"]` and `["templates", id]` on success

## 5. Locales

- [x] 5.1 Add `templateEditor` namespace to `locales/en.json` — keys: `title`, `backToTemplates`, `save`, `saving`, `saveSuccess`, `saveError`, `fields` (name, subject, fromName, replyTo, preheader, mjml, sampleData), `preview` (title, errorTitle, emptyState), `sampleData` (label, description, invalid)

## 6. Editor Components

- [x] 6.1 Create `features/templates/components/TemplatePreviewPane.tsx` — `"use client"` component; accepts `html: string` and `compilationError: string | null`; renders an `<iframe srcdoc={html} sandbox="" title="Email preview" />` at full height, or an error callout if `compilationError` is set
- [x] 6.2 Create `features/templates/pages/TemplateEditorPage.tsx` — `"use client"` page component; uses `useTemplate(id)` to load the record (shows skeleton during load); renders a react-hook-form with all mutable fields (name, subject, fromName, replyTo, preheader, mjml) plus a separate uncontrolled `sampleData` JSON state; debounces MJML recompile (≤500 ms) by: applying Handlebars to the current form values using `sampleData`, then compiling with `mjml-browser`; passes compiled HTML and any error to `TemplatePreviewPane`; save button calls `useUpdateTemplate` with current form values; shows success/error toast via `sonner`

## 7. Route

- [x] 7.1 Create `app/(authenticated)/templates/[id]/edit/page.tsx` — thin RSC shell; dynamically imports `TemplateEditorPage` with `{ ssr: false }` to prevent `mjml-browser` SSR failures; passes `params.id` as prop

## 8. List Integration

- [x] 8.1 Add an edit icon-button link (`/templates/${template.id}/edit`) to each row in `features/templates/components/TemplateList.tsx`, placed before the delete button in the actions column; use a `PencilIcon` with `aria-label`
