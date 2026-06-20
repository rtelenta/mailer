## 1. Install Dependencies

- [x] 1.1 Install `@codemirror/lang-json`

## 2. Extend CodeEditor Component

- [x] 2.1 Add `lang?: "xml" | "json"` prop to `components/ui/code-editor.tsx` — default `"xml"`; resolve to the appropriate CodeMirror `LanguageSupport` internally
- [x] 2.2 Add `placeholder?: string` prop to `components/ui/code-editor.tsx` using the `placeholder()` extension from `@codemirror/view`

## 3. TemplateEditorPage

- [x] 3.1 Replace the sampleData `<Textarea>` in `features/templates/pages/TemplateEditorPage.tsx` with `<CodeEditor lang="json" value={sampleData} onChange={setSampleData} placeholder='{ "name": "Alice" }' />`
- [x] 3.2 Remove the `Textarea` import from TemplateEditorPage if no longer used

## 4. Spec Update

- [x] 4.1 Update `openspec/specs/mjml-template-editor/spec.md` UR-1 to mention the JSON code editor for the sample-data field
