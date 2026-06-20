## 1. Install Dependencies

- [x] 1.1 Install CodeMirror 6 packages: `@codemirror/view`, `@codemirror/state`, `@codemirror/lang-xml`, `@codemirror/theme-one-dark`

## 2. CodeEditor Component

- [x] 2.1 Create `components/ui/code-editor.tsx` — a controlled React component wrapping CodeMirror 6 with XML language support and One Dark theme, accepting `value: string` and `onChange: (value: string) => void` props

## 3. CreateTemplateSheet

- [x] 3.1 Remove the MJML `<Field>` block (textarea + label) from `features/templates/components/CreateTemplateSheet.tsx`

## 4. TemplateEditorPage

- [x] 4.1 Replace the `<Textarea>` MJML field with `<Controller>` + `<CodeEditor>` in `features/templates/pages/TemplateEditorPage.tsx`
- [x] 4.2 Remove the `Textarea` import from TemplateEditorPage if no longer used

## 5. Spec Update

- [x] 5.1 Update `openspec/specs/mjml-template-editor/spec.md` FR-3 and UR-1 to reference "code editor" instead of "text area"
