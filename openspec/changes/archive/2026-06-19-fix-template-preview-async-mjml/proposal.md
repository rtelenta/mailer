## Why

`mjml-browser` v5 returns a `Promise<MJMLParseResults>` — not a synchronous result. `compilePreview` in `TemplateEditorPage` calls it without `await`, so `result` is a Promise object. `result.errors` and `result.html` are both `undefined`, giving two cascading bugs:

1. The previous "Compilation error: Cannot read properties of undefined (reading 'length')" was `result.errors.length` on the Promise object.
2. After patching that to `result.errors?.length`, the code falls through to `return { html: result.html, error: null }` where `result.html` is also `undefined` — so `previewHtml` is never populated and the preview always shows "Start typing MJML to see a preview."

## What Changes

- Make `compilePreview` async and `await` the `mjml()` call.
- Update the `setTimeout` callback in the preview `useEffect` to `await` the now-async `compilePreview`.

## Non-goals

- No changes to the MJML source, Handlebars interpolation, or sample-data logic.
- No changes to `TemplatePreviewPane` or API routes.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

_None._ This is a correctness fix; the intended behavior (live preview) has always been the spec.

## Impact

- UI only: `features/templates/pages/TemplateEditorPage.tsx`
- No API, DB, or environment variable changes.
