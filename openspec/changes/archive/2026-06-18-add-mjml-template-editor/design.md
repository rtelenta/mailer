## Context

Templates are stored with MJML source in the DB (added by `add-template-management`). There is no UI to edit a template after creation — the create sheet only accepts MJML as typed text with no feedback. Users need an editing surface that renders the HTML output as they write.

## Goals / Non-Goals

**Goals:**
- Full-page editor at `/templates/:id/edit` with code pane (MJML) and preview pane (HTML iframe)
- Live compilation: preview re-renders on each change with a short debounce
- Header fields (subject, from-name, reply-to, preheader) editable above or alongside the code pane
- Handlebars variable substitution in both MJML source and header fields before rendering
- JSON sample-data input whose values are applied to Handlebars tokens in the preview
- Save action calls `PATCH /api/templates/:id`
- Edit link on each row in the templates list

**Non-Goals:**
- Syntax highlighting or auto-complete in the MJML code pane (plain textarea is sufficient)
- Variable validation — unknown or missing variables are rendered as empty strings by Handlebars
- Version history or draft/published states
- Real-time multi-user collaboration
- Mobile layout (editor is a desktop-first tool)

## Decisions

### MJML compilation: client-side via `mjml-browser`

**Decision:** Compile MJML to HTML on the client using `mjml-browser`.

**Why not server-side preview endpoint:** A round-trip per keystroke would require debounced fetches, error handling for network lag, and a new API surface. Client-side compilation eliminates latency, works offline, and keeps the API clean.

**Tradeoff:** `mjml-browser` adds ~500 KB gzipped to the editor route bundle. Acceptable because the editor is a separate lazy-loaded route (`dynamic(() => import(…), { ssr: false })`). The main templates list is unaffected.

**SSR guard:** `mjml-browser` uses browser globals. The editor component must be dynamically imported with `{ ssr: false }` to prevent build-time failures in Next.js RSC.

### Handlebars substitution: `handlebars` package, applied before MJML compile

**Decision:** Run Handlebars template compilation on the raw MJML string (using sample-data JSON) before passing the result to `mjml-browser`.

**Why before MJML compile, not after:** MJML attributes (like `font-size`, `padding`) must be valid at parse time. Substituting first keeps the MJML valid. Post-HTML substitution would also work but requires parsing rendered HTML.

**Error handling:** Both Handlebars and MJML compilation can throw. Catch both and display the error message in the preview pane instead of the iframe.

### Code pane: styled `<textarea>` (no rich editor)

**Decision:** Use the existing shadcn `Textarea` component with monospace styling.

**Why not CodeMirror/Monaco:** The user didn't ask for syntax highlighting. Adding a rich editor adds a significant dependency (~1 MB for Monaco), a new learning curve, and integration complexity with react-hook-form. The plain textarea is already available and works with `register()`.

### Layout: stacked header fields + horizontal two-pane split

```
┌─────────────────────────────────────────────────────────┐
│ ← Back   Template name                        [Save]    │
├────────────────────────────┬────────────────────────────┤
│ Subject / From / Reply-To  │                            │
│ Preheader                  │   [HTML Preview iframe]    │
├────────────────────────────│                            │
│ [MJML textarea]            │                            │
│                            │                            │
│ Sample Data (JSON)         │                            │
└────────────────────────────┴────────────────────────────┘
```

Fields and code are in the left pane; preview occupies the full height of the right pane.

### `PATCH /api/templates/:id` Hono route signature

```typescript
// PATCH /templates/:id
// Body: Partial<createTemplateSchema> — all fields optional
// 200: updated TemplateRecord
// 401: unauthenticated
// 403: template belongs to different user
// 404: not found
// 422: validation failure
```

The Drizzle schema does not change — all fields are already nullable or have defaults.

### Route file: app/(authenticated)/templates/[id]/edit/page.tsx

Next.js dynamic segment. The page is a thin RSC shell that renders a `"use client"` page component imported via `dynamic(..., { ssr: false })`.

## Risks / Trade-offs

- **`mjml-browser` bundle size** → Mitigated by lazy loading the editor component. The list and other routes are unaffected.
- **`mjml-browser` API diverges from server-side `mjml`** → The browser build supports the standard MJML component set. Custom components are out of scope.
- **Handlebars in user-supplied MJML can call helpers** → Handlebars `compile` is safe for template rendering; the sandbox isn't a concern since only the user's own template is rendered in their own browser.
- **iframe preview XSS** → Preview is rendered into a sandboxed iframe with `sandbox="allow-same-origin"` removed. The rendered HTML is the user's own template — no cross-user data.

## Open Questions

- None blocking. Sample-data validation (schema enforcement) can be added as a follow-on if users ask for it.
