## Context

`app/globals.css` uses Tailwind v4's `@theme inline` to wire the Geist font (loaded by `next/font/google` via a CSS variable) into the Tailwind token system:

```css
@theme inline {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --font-heading: var(--font-sans);   ← the problem
  ...
}
```

In Tailwind v4, `@theme inline` is intended for mapping theme tokens to values that should be inlined into utility classes rather than emitted as `:root` CSS variables. However, `--font-heading: var(--font-sans)` creates a CSS `var()` reference to `--font-sans` — which is itself a Tailwind theme token. This forces Tailwind to emit `--font-sans` as a real CSS variable in the compiled `@layer theme` block, but it can only produce a self-referential placeholder:

```css
/* compiled output */
@layer theme {
  :root, :host {
    --font-sans: var(--font-sans);          /* circular — always undefined */
    --default-font-family: var(--font-sans); /* broken for the same reason */
    --default-mono-font-family: var(--font-geist-mono); /* correct — no circular dep */
  }
}
```

As a result, every path that depends on `--font-sans` resolves to the browser default:
- Tailwind preflight (`html { font-family: var(--default-font-family) }`) → fallback
- `html { font-family: var(--font-sans) }` from `@layer base` → fallback
- `.font-sans { font-family: var(--font-sans) }` utility → fallback

Geist is loaded correctly by `next/font/google` (confirmed by the compiled `@font-face` blocks and the `.variable` class that sets `--font-geist-sans`), but the CSS variable chain that delivers it to the page is broken.

## Goals / Non-Goals

**Goals:**
- Make `--font-sans` resolve correctly to Geist throughout the page
- Preserve the `--font-heading` alias if it will be used in the future

**Non-Goals:**
- Changing how the font is loaded (`next/font/google` + `variable` option is correct)
- Any changes outside `app/globals.css`

## Decisions

**Fix `--font-heading` to reference the Next.js variable directly**

Change:
```css
--font-heading: var(--font-sans);
```
to:
```css
--font-heading: var(--font-geist-sans);
```

This removes the CSS `var()` reference to the Tailwind theme token `--font-sans` from inside `@theme inline`. Without it, Tailwind correctly handles `@theme inline { --font-sans: var(--font-geist-sans) }` — the compiled output becomes `--default-font-family: var(--font-geist-sans)` (like mono already works), and the circular `--font-sans: var(--font-sans)` emission disappears.

**Alternative considered: use `@theme` (without `inline`) for font variables**

Switching to `@theme { --font-sans: var(--font-geist-sans) }` would create a real `:root` CSS variable `--font-sans: var(--font-geist-sans)`, which would correctly resolve through CSS inheritance. This also works, but it changes the behaviour of the `font-sans` utility class (which would emit `var(--font-sans)` instead of `var(--font-geist-sans)`) and would require auditing all other `@theme inline` entries to ensure they don't conflict. A targeted one-line fix is preferable.

**Alternative considered: remove `--font-heading` entirely**

`--font-heading` is not referenced anywhere in the codebase other than the definition in `globals.css`. Removing it would fix the bug with no behavioural change. However, keeping it (pointing directly to `var(--font-geist-sans)`) costs nothing and preserves the hook for future use.

## Risks / Trade-offs

- **Risk**: Future developers add another `var(--font-sans)` inside `@theme inline`, re-introducing the circular reference → Mitigation: the design document explains the constraint; the fix makes the working pattern obvious from the existing mono token.

- **Trade-off**: `--font-heading` now hardcodes `var(--font-geist-sans)` rather than being derived from `--font-sans`. If the sans font is ever changed, `--font-heading` must be updated separately → Acceptable: both live in the same `@theme inline` block and any font change would touch both lines anyway.
