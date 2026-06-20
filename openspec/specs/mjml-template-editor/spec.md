# MJML Template Editor

Full-page authoring experience for a single email template. Two-pane layout: raw MJML code editor on the left, live HTML preview on the right.

---

## Functional Requirements

### FR-1: Editor Route

The editor MUST be accessible at `/templates/:id/edit`.

The page MUST load the existing template record for the given `id`. If the `id` does not exist or belongs to a different user, the page MUST redirect to `/templates`.

### FR-2: Header Field Editing

The editor MUST display editable fields for:
- `name` (template name, shown in the page header)
- `subject`
- `fromName`
- `replyTo` (optional)

All validation rules from `template-management` FR-1 apply (same field constraints).

### FR-3: MJML Code Pane

The editor MUST display a text area containing the template's current `mjml` value.

Changes to the text area MUST trigger a live recompile of the preview after a debounce of no more than 500 ms.

### FR-4: Live HTML Preview

The editor MUST render the compiled HTML in an iframe alongside the code pane.

Compilation MUST run entirely client-side using the `mjml-browser` package.

Before compiling, the editor MUST apply Handlebars substitution using the current sample-data values (FR-5). The substituted MJML string is what gets passed to the MJML compiler.

If MJML compilation fails, the preview pane MUST display the error message instead of the iframe.

### FR-5: Sample Data Input

The editor MUST provide a JSON input field where users can enter key-value pairs used for Handlebars substitution.

The sample data input MUST accept any valid JSON object. Invalid JSON MUST show a parse error inline; the preview MUST continue to show the last valid render.

When sample data is present, Handlebars tokens (`{{variableName}}`) in both the MJML source and header fields (`subject`, `fromName`, `replyTo`) MUST be replaced with corresponding values before preview render.

Missing or unknown variables MUST render as empty strings (Handlebars default behavior). No variable validation is performed.

### FR-6: Save

The editor MUST provide a Save button that persists all current field values and `mjml` to the server via `PATCH /api/templates/:id`.

The Save button MUST be disabled while a save is in flight.

On success, the editor MUST display a success toast. On failure, the editor MUST display an error toast with the server error message.

Sample data is NOT saved — it is session-local state only.

### FR-7: Edit Link in Template List

Each row in the templates list MUST include a link or button that navigates to `/templates/:id/edit`.

### FR-8: Send Test Email Action

- The editor header MUST include a "Send Test" button
- Clicking the button MUST POST to `POST /api/templates/:id/test-send` with the current sample data parsed as JSON (or `{}` if the sample data field is empty or invalid JSON)
- While the request is in flight the button MUST be disabled and show a loading indicator
- On success the system MUST show a success toast: `t("templateEditor.testSend.success")`
- On 429 (rate limit) the system MUST show an error toast: `t("templateEditor.testSend.rateLimitError")`
- On 502 or other failure the system MUST show an error toast: `t("templateEditor.testSend.deliveryError")`

---

## API Requirements

### AR-1: PATCH /api/templates/:id

`PATCH /api/templates/:id` MUST accept a JSON body with any subset of mutable template fields:

```
name?:      string, min 1, max 255
mjml?:      string, min 1, max 500,000 chars
subject?:   string, min 1, max 998
fromName?:  string, min 1, max 255
replyTo?:   string, valid email | null
```

The endpoint MUST return the full updated `TemplateRecord` on success (`200`).

The endpoint MUST return `401` if unauthenticated, `403` if the template belongs to a different user, `404` if not found, and `422` on validation failure.

The endpoint MUST update `updatedAt` to the current timestamp.

---

## Interface Contracts

### Updated TemplateRecord (PATCH response)

```typescript
interface TemplateRecord {
  id: string;
  userId: string;
  name: string;
  mjml: string;
  subject: string;
  fromName: string;
  replyTo: string | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

### PATCH request body

```typescript
interface UpdateTemplateInput {
  name?: string;
  mjml?: string;
  subject?: string;
  fromName?: string;
  replyTo?: string | null;
}
```

---

## UI Requirements

### UR-1: Layout

The editor uses the authenticated app shell (sidebar + header). The content area is a full-height two-column layout:

- Left column: header fields stacked vertically, then the MJML textarea (flex-grow to fill remaining height), then the sample-data JSON input
- Right column: the HTML preview iframe, full height of the content area

### UR-2: Navigation

The page MUST include a back link or button that navigates to `/templates`.

### UR-3: Loading State

While the template record is being fetched, the editor MUST show skeleton placeholders for the fields and code pane.

### UR-4: Preview iframe

The preview iframe MUST use `srcdoc` to render HTML (not a URL). It MUST have `sandbox=""` set (no scripts, no same-origin access) to isolate the rendered email content.

---

## i18n Keys

```json
"templateEditor": {
  "testSend": {
    "button": "Send Test",
    "sending": "Sending...",
    "success": "Test email sent to your inbox.",
    "rateLimitError": "Daily limit reached (100 test emails). Try again tomorrow.",
    "deliveryError": "Failed to deliver the test email. Check your email settings."
  }
}
```
