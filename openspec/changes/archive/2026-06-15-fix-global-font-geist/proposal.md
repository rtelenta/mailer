## Why

The Geist font is configured via `next/font/google` and a Tailwind v4 `@theme inline` block, but a circular CSS variable reference prevents it from loading in the browser. The entire page falls back to the browser default (system-ui) instead of Geist.

## What Changes

- Fix `--font-heading: var(--font-sans)` in `@theme inline` — this line causes Tailwind v4 to emit `--font-sans: var(--font-sans)` (self-referential, always undefined) in the compiled theme layer, which breaks the entire sans-font chain (`--default-font-family`, preflight, and the `font-sans` utility)
- Change the reference to point directly at the Next.js CSS variable (`var(--font-geist-sans)`) so it resolves correctly without creating a circular dependency

## Non-goals

- No changes to how Geist is loaded (the `next/font/google` setup in `layout.tsx` is correct)
- No changes to theming or color variables
- No introduction of a new font or font stack

## Capabilities

### New Capabilities
_(none)_

### Modified Capabilities
_(none — this is a bug fix to the project-foundation configuration; no spec-level requirement is changing)_

## Impact

- **File**: `app/globals.css` — one line in `@theme inline`
- **Scope**: UI-only; no API, DB, or auth changes
- **Environment variables**: none required
