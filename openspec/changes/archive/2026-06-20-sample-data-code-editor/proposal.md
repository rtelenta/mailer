# Proposal: Code Editor for Sample Data JSON

## What

Replace the plain `<Textarea>` used for the sample-data JSON input in `TemplateEditorPage` with the `<CodeEditor>` component (already introduced for MJML), configured with JSON language support.

## Why

The sample-data field accepts arbitrary JSON that is merged into the Handlebars template at preview time. A plain textarea gives no feedback on syntax errors — the user only discovers malformed JSON when the preview fails. A CodeEditor with JSON mode provides syntax highlighting and makes structural errors visible immediately.

The `<CodeEditor>` component is already available. The only additions needed are: `@codemirror/lang-json` package, a `lang` prop on `<CodeEditor>` to select the language, and a `placeholder` prop for the hint text.

## Scope

- Install `@codemirror/lang-json`
- Extend `<CodeEditor>` with a `lang?: "xml" | "json"` prop and a `placeholder?: string` prop
- Replace the sampleData `<Textarea>` in `TemplateEditorPage` with `<CodeEditor lang="json" placeholder='{ "name": "Alice" }' />`
- Update `mjml-template-editor` spec UR-1 to mention the JSON code editor for the sample-data field

## Out of Scope

- JSON schema validation or autocomplete
- Changes to any API or database
- Linting or formatting on save
