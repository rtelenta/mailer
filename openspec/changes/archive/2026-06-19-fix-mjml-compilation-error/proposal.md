## Why

`compilePreview` in `TemplateEditorPage` crashes with `Cannot read properties of undefined (reading 'length')` because `mjml-browser` does not guarantee an `errors` array when called with `validationLevel: "skip"`. This breaks the preview for every template in the editor.

## What Changes

- Guard `result.errors` access in `compilePreview` so it handles `undefined` safely.

## Non-goals

- No changes to mjml compilation logic or validation level.
- No changes to preview rendering or sample-data handling.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

_None._ This is a runtime safety fix with no requirement-level behavior change.

## Impact

- UI only: `features/templates/pages/TemplateEditorPage.tsx`
- No API, DB, or environment variable changes.
