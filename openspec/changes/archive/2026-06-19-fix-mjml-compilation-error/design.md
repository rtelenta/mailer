## Context

`compilePreview` in `TemplateEditorPage` calls `mjml(substituted, { validationLevel: "skip" })` then immediately accesses `result.errors.length`. When `validationLevel: "skip"` is set, `mjml-browser` omits the `errors` array from its return value, causing a runtime crash on every template load.

## Goals / Non-Goals

**Goals:**
- Guard the `errors` access so an absent array is treated as empty.

**Non-Goals:**
- Changing validation level or mjml options.
- Modifying error display or sample-data logic.

## Decisions

**Use optional chaining (`result.errors?.length`)** — one-character fix at the callsite, no abstraction needed. Alternative of wrapping in try/catch would hide legitimate errors; defensive `?? []` fallback on the array also works but reads less naturally than optional chaining for a length check.

## Risks / Trade-offs

None. The change makes no observable difference when `errors` is present; it only prevents the crash when it's absent.
