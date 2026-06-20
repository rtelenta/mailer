# Design: optional-mjml-on-create

## Goals

- Allow template creation with no MJML body supplied
- Store empty string in the DB when MJML is omitted (no schema migration needed)
- Keep all existing validation for non-empty MJML (max 500,000 chars still applies)

## Non-Goals

- No null support for the `mjml` column — empty string is the canonical "no content yet" state
- No starter/placeholder MJML — the editor already handles an empty code pane

---

## Changes

### 1. API create schema (`lib/api/templates.ts`)

Change `createTemplateSchema`:

```ts
// Before
mjml: z.string().min(1).max(500_000),

// After
mjml: z.string().max(500_000).optional(),
```

In the POST handler, default the value when absent:

```ts
// Before
const { name, mjml, subject, fromName, replyTo } = parsed.data;

// After
const { name, subject, fromName, replyTo } = parsed.data;
const mjml = parsed.data.mjml ?? "";
```

### 2. Client type (`types/templates.ts`)

Update `CreateTemplateInput`:

```ts
// Before
interface CreateTemplateInput {
  name: string;
  mjml: string;
  subject: string;
  fromName: string;
  replyTo?: string;
}

// After
interface CreateTemplateInput {
  name: string;
  mjml?: string;
  subject: string;
  fromName: string;
  replyTo?: string;
}
```

### 3. Create form (`features/templates/components/CreateTemplateSheet.tsx`)

Update the Zod schema:

```ts
// Before
mjml: z.string().min(1).max(500_000),

// After
mjml: z.string().max(500_000).optional(),
```

The mutation call already passes `data.mjml` — it will be `undefined` when the user leaves the textarea blank, which the API now accepts.
