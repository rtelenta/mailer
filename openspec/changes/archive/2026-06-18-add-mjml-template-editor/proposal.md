## Why

The template list lets users manage templates, but there is no way to actually author them. Editing raw MJML without a live preview is impractical — users need to see the rendered output as they write.

## What Changes

- Add a full-page template editor route (`/templates/:id/edit`) accessible from the templates list
- Two-pane layout: left pane is a raw MJML code editor, right pane renders the compiled HTML live on every change
- Header fields (subject, from-name, reply-to, preheader) are editable inline at the top of the editor
- Handlebars variables (`{{variableName}}`) are supported anywhere in the body and fields
- A "Sample data" input (JSON) lets users supply values for variables and see fully-rendered preview output
- Save action persists changes to the existing template record via `PATCH /api/templates/:id`
- No variable validation — unknown or missing variables are left as-is by the renderer

## Capabilities

### New Capabilities

- `mjml-template-editor`: Full-page editor for a single template — code input, live HTML preview, header field editing, Handlebars sample-data substitution, and save.

### Modified Capabilities

- `template-management`: Add `PATCH /api/templates/:id` endpoint (update all mutable fields). Add edit button/link in the list row.

## Impact

- New route `app/(authenticated)/templates/[id]/edit/`
- New `features/templates/pages/TemplateEditorPage.tsx` and supporting components
- `lib/api/templates.ts`: add `PATCH /api/templates/:id` handler with Zod validation
- New `features/templates/hooks/useUpdateTemplate.ts` mutation
- Add `mjml` package (browser-compatible build) for client-side MJML → HTML compilation
- Add `handlebars` package for client-side variable substitution before preview render
- `locales/en.json`: new `templateEditor` namespace
