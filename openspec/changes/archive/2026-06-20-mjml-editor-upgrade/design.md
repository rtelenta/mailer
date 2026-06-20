## Context

The CreateTemplateSheet currently includes an optional MJML textarea. Since MJML is already optional (server defaults to `""`), the field adds noise without value — users have no preview context during creation.

The TemplateEditorPage uses a standard HTML `<Textarea>` for the MJML code pane. MJML is XML-based, and a plain textarea offers no syntax highlighting, no line numbers, and poor UX for multi-hundred-line templates.

## Goals / Non-Goals

**Goals:**
- Remove MJML input from CreateTemplateSheet entirely
- Replace the editor-page textarea with CodeMirror 6 (XML mode)
- Keep the code editor controlled by react-hook-form (same form state, same save flow)

**Non-Goals:**
- MJML schema-aware autocomplete or linting
- API or DB changes
- Monaco Editor (heavier, slower cold start)

## Decisions

**CodeMirror 6 over Monaco Editor**
CodeMirror 6 is modular — only the pieces needed (state, view, lang-xml) are included. Monaco bundles the full VS Code language server infrastructure and adds significant weight. For syntax highlighting + line numbers on MJML (which is just XML), CodeMirror is sufficient.

Packages: `@codemirror/view`, `@codemirror/state`, `@codemirror/lang-xml`, `@codemirror/theme-one-dark`

**Controlled via react-hook-form Controller**
The CodeMirror editor is not a standard HTML input, so it cannot use `register()`. Use `<Controller>` to bridge the `EditorView` `onChange` callback to the form field value.

**Remove MJML from CreateTemplateSheet (no replacement)**
The field is already optional. Removing it means the template starts with `mjml: ""` and the user goes to the editor page to author MJML. No UX gap — the edit link is visible from the list immediately after creation.

## Risks / Trade-offs

- [Bundle size increase] CodeMirror 6 adds ~100–150 KB gzipped → Acceptable; the editor page is not the landing page
- [SSR] CodeMirror requires a DOM → wrap the editor component in `dynamic(() => import(...), { ssr: false })` or use a `"use client"` boundary (already the case for TemplateEditorPage)
- [Controlled editor value reset] When the template loads, the EditorView must be seeded with the initial MJML value and reset if the user navigates away → Handle via `useEffect` that calls `view.dispatch(...)` when form `reset()` fires, or use a `key` prop on the editor tied to `template.id`

## Migration Plan

1. Install packages
2. Create a thin `<CodeEditor>` wrapper component (controlled, `value` + `onChange` props)
3. Remove MJML field from CreateTemplateSheet
4. Replace Textarea with `<Controller><CodeEditor /></Controller>` in TemplateEditorPage
5. Update `mjml-template-editor` spec FR-3 / UR-1 wording
