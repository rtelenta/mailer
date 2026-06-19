## Context

`mjml-browser` v5 is asynchronous. `compilePreview` calls `mjml()` synchronously and reads properties off the returned Promise object, which has no `html` or `errors` property.

## Goals / Non-Goals

**Goals:**
- Properly `await` the `mjml()` Promise so compiled HTML is returned to the preview.

**Non-Goals:**
- Not changing MJML options, Handlebars handling, or preview pane rendering.

## Decisions

**Make `compilePreview` async, await `mjml()`** — smallest change that fixes the root cause. The `setTimeout` callback in the preview `useEffect` becomes `async` so it can `await compilePreview`. React's cleanup (`clearTimeout`) is not affected by the inner async callback.

No other callers of `compilePreview` exist, so making it async has no ripple effects.

## Risks / Trade-offs

None. Awaiting the Promise is the correct usage. The 300 ms debounce already absorbs any async latency.
