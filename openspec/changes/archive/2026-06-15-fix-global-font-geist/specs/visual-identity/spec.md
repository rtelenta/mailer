## MODIFIED Requirements

### Requirement: Geist Sans is the global typeface
The system SHALL load Geist Sans via `next/font/google` in `app/layout.tsx` using `variable: "--font-geist-sans"`. The `@theme inline` block in `app/globals.css` SHALL map `--font-sans` to `var(--font-geist-sans)` so that the Tailwind `font-sans` token resolves to Geist Sans. The `html` base rule SHALL apply `font-sans` (already present via `@apply font-sans`). Any other custom font alias tokens inside the same `@theme inline` block (e.g. `--font-heading`) MUST reference the Next.js CSS variable (`var(--font-geist-sans)`) directly — they SHALL NOT reference other `@theme inline` tokens via `var()`, as this causes Tailwind v4 to emit a circular self-reference for the referenced token.

#### Scenario: Font variable chain is correctly wired
- **WHEN** the application CSS is compiled
- **THEN** the `--font-sans` Tailwind token resolves to the Geist Sans font family (not a self-referencing or undefined variable)

#### Scenario: Body text renders in Geist Sans
- **WHEN** a page is loaded in the browser
- **THEN** the `font-family` computed style on `<body>` includes the Geist Sans typeface

#### Scenario: Font alias tokens do not introduce circular dependencies
- **WHEN** `@theme inline` contains a custom alias token that should match the sans font (e.g. `--font-heading`)
- **THEN** that token references `var(--font-geist-sans)` directly, not `var(--font-sans)`, so it does not force a circular `--font-sans: var(--font-sans)` emission
