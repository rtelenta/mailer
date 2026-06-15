## 1. Fix circular font variable in globals.css

- [x] 1.1 In `app/globals.css`, inside the `@theme inline` block, change `--font-heading: var(--font-sans)` to `--font-heading: var(--font-geist-sans)`

## 2. Verify

- [x] 2.1 Run the dev server and confirm the browser renders page text in Geist Sans (not system-ui or another fallback)
- [x] 2.2 Inspect the computed `font-family` on `<body>` in DevTools and confirm it resolves to `"Geist", "Geist Fallback"` (not `var(--font-sans)` or a system font)
