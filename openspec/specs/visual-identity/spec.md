## Purpose

Defines the visual identity requirements for the application, including dark mode enforcement, native browser element theming, and global typeface configuration.

## Requirements

### Requirement: Dark mode is permanently active on all pages
The system SHALL apply the `.dark` class to the root `<html>` element in `app/layout.tsx` so that the dark CSS variable set is always in effect. The class SHALL NOT be toggled at runtime. No `ThemeProvider`, `useTheme` hook, or theme toggle component SHALL exist anywhere in the component tree.

#### Scenario: Dark class is present on the HTML element at render
- **WHEN** any page of the application is rendered
- **THEN** the `<html>` element has the `dark` class in its `className`

#### Scenario: No theme toggle is rendered
- **WHEN** any page of the application is rendered
- **THEN** no theme toggle control (button, switch, or dropdown) is present in the DOM

### Requirement: Native browser elements render in dark mode
The system SHALL declare `color-scheme: dark` on the `html` selector inside `@layer base` in `app/globals.css`. This ensures scrollbars, form controls, and other browser-native UI elements match the dark visual context.

#### Scenario: color-scheme is set to dark
- **WHEN** the application CSS is parsed by the browser
- **THEN** the computed `color-scheme` for the `html` element is `dark`

### Requirement: Geist Sans is the global typeface
The system SHALL load Geist Sans via `next/font/google` in `app/layout.tsx` using `variable: "--font-geist-sans"`. The `@theme inline` block in `app/globals.css` SHALL map `--font-sans` to `var(--font-geist-sans)` so that the Tailwind `font-sans` token resolves to Geist Sans. The `html` base rule SHALL apply `font-sans` (already present via `@apply font-sans`).

#### Scenario: Font variable chain is correctly wired
- **WHEN** the application CSS is parsed
- **THEN** the `--font-sans` Tailwind token resolves to the Geist Sans font family (not a self-referencing or undefined variable)

#### Scenario: Body text renders in Geist Sans
- **WHEN** a user views any page of the application
- **THEN** the `font-family` computed style on `<body>` includes the Geist Sans typeface
