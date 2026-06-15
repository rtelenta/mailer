## Why

The app has no defined visual identity — Tailwind defaults ship with light/dark mode scaffolding that conflicts with a permanently dark product. Establishing a locked-down dark palette and typeface now prevents inconsistent styling as more pages and components are added.

## What Changes

- Replace default Tailwind color tokens with a curated dark-native palette in `app/globals.css`
- Remove any `prefers-color-scheme` media queries and light-mode CSS variables — dark is the only mode
- Set `color-scheme: dark` on `<html>` for native browser UI elements (scrollbars, inputs, date pickers)
- Load Geist Sans via `next/font/google` and apply it as the root typeface
- Remove any theme toggle UI or `ThemeProvider` wrapping (if present)

## Capabilities

### New Capabilities
- `visual-identity`: Permanent dark color palette, dark browser rendering, and Geist Sans typeface applied globally to all pages. No light mode. No theme toggle.

### Modified Capabilities

## Impact

- UI only — no API, DB schema, or auth changes
- Affects `app/layout.tsx` (font injection, `color-scheme`) and `app/globals.css` (CSS variables, base styles)
- shadcn/ui components inherit from CSS variables; updating the palette here cascades to all components automatically
- No new env vars required

## Non-goals

- Custom themes or per-user color preferences
- Light mode or system-preference detection
- Any changes to the auth flow, API routes, or database
