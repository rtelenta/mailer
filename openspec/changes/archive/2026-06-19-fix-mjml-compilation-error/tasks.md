## Tasks

- [x] In `compilePreview` in `features/templates/pages/TemplateEditorPage.tsx`, change `result.errors.length` to `result.errors?.length` to guard against an undefined `errors` array returned by `mjml-browser` when `validationLevel: "skip"` is set
