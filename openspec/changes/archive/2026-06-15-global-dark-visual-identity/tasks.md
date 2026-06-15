## 1. CSS — Wire Geist Sans and lock dark mode

- [x] 1.1 In `app/globals.css`, inside `@theme inline`, change `--font-sans: var(--font-sans)` to `--font-sans: var(--font-geist-sans)`
- [x] 1.2 In `app/globals.css`, inside `@layer base`, extend the `html` rule to add `color-scheme: dark`

## 2. Layout — Apply dark class to root HTML element

- [x] 2.1 In `app/layout.tsx`, add `"dark"` to the `className` of the `<html>` element (alongside the existing font variables and `h-full antialiased`)
