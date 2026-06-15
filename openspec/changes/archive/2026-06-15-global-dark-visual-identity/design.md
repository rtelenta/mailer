## Context

The app was scaffolded with shadcn/ui defaults, which ship a dual-mode CSS variable system: a light `:root` block and a dark `.dark` class block. No `.dark` class is applied to `<html>` at runtime, so the app currently renders in light mode. Additionally, the font variable chain is broken — `next/font` injects `--font-geist-sans` but `@theme inline` maps `--font-sans` to itself (`var(--font-sans)`), so Geist Sans never reaches Tailwind's font-sans token.

Two files own the entire visual layer: `app/globals.css` (CSS variables + Tailwind base) and `app/layout.tsx` (font injection + root `<html>` element).

## Goals / Non-Goals

**Goals:**
- Dark palette is always active — no runtime class toggling, no `prefers-color-scheme` detection
- Native browser elements (scrollbars, inputs, date pickers) render dark via `color-scheme: dark`
- Geist Sans is correctly wired from `next/font` through to the Tailwind `font-sans` token
- No theme toggle UI exists anywhere in the component tree

**Non-Goals:**
- Changing the actual OKLCH color values from the shadcn dark palette (palette iteration is a separate concern)
- Removing Geist Mono (kept for code/monospace contexts)
- Any changes outside of `app/globals.css` and `app/layout.tsx`

## Decisions

### Add `dark` class to `<html>` — do not flatten CSS variables into `:root`

**Chosen:** Add `className="dark"` to the `<html>` element in `app/layout.tsx`.

**Rationale:** The shadcn `.dark` class convention is the load-bearing mechanism for all current and future shadcn components. Flattening the dark palette into `:root` and deleting the `.dark` block would achieve the same visual result today but silently break any shadcn component added later that expects the class-based split. Adding `class="dark"` to `<html>` locks the mode without disrupting the CSS architecture.

**Alternative considered:** Rename `.dark { ... }` to `:root { ... }` and delete the existing `:root` block. Rejected — harms future shadcn compatibility.

### Fix the font chain by correcting the `@theme inline` mapping

**Chosen:** In `globals.css`, change `--font-sans: var(--font-sans)` to `--font-sans: var(--font-geist-sans)` inside `@theme inline`.

**Rationale:** `next/font` injects the CSS custom property `--font-geist-sans` (controlled by the `variable` option in `layout.tsx`). The `@theme inline` block must bridge that injected variable to the Tailwind `--font-sans` token. The current self-reference (`var(--font-sans)`) resolves to nothing.

**Alternative considered:** Change `variable: "--font-geist-sans"` to `variable: "--font-sans"` in `layout.tsx`. Rejected — `--font-geist-sans` is a descriptive, scoped name; overwriting it with a generic `--font-sans` conflates font identity with the Tailwind token name.

### Add `color-scheme: dark` to the `html` base rule

**Chosen:** Inside the `@layer base` block in `globals.css`, extend the `html` rule to include `color-scheme: dark`.

**Rationale:** The CSS `color-scheme` property tells the browser to render native UI chrome (scrollbars, form controls, selection highlights) in dark mode. Without it, native elements render light even when the page background is dark.

## Risks / Trade-offs

- **shadcn component additions** — Any `npx shadcn add` in the future will regenerate CSS variables in `globals.css`. The regenerated output will re-introduce the light `:root` block and omit the `color-scheme` rule. Developers must remember to revert those sections after each component scaffold. → Mitigation: document this in the PR description; enforce via code review.
- **`@custom-variant dark` remains** — The `@custom-variant dark (&:is(.dark *))` line stays in `globals.css`. It is now always active (since `<html class="dark">`). This is intentional: shadcn components use `dark:` Tailwind variants, which must resolve. Removing it would break component dark-mode styling.
