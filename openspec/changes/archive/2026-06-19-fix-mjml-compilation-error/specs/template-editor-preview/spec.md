## ADDED Requirements

### Requirement: compilePreview handles undefined errors array
`compilePreview` in `TemplateEditorPage` SHALL NOT throw when `mjml()` returns a result where the `errors` property is `undefined` or absent. It MUST treat a missing `errors` array the same as an empty array.

#### Scenario: mjml returns result without errors array
- **WHEN** `mjml()` is called with `validationLevel: "skip"` and returns a result where `errors` is `undefined`
- **THEN** `compilePreview` SHALL return `{ html: result.html, error: null }` without throwing

#### Scenario: mjml returns result with populated errors array
- **WHEN** `mjml()` returns a result with one or more entries in `errors`
- **THEN** `compilePreview` SHALL return `{ html: "", error: <formatted error messages> }`
