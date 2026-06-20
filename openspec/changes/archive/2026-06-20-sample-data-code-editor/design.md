## Context

The `<CodeEditor>` component in `components/ui/code-editor.tsx` currently hardcodes the XML language extension. The sampleData field uses a local React state string (`sampleData` / `setSampleData`) rather than react-hook-form, so the `onChange: (value: string) => void` interface matches directly — no `<Controller>` wrapper needed.

## Goals / Non-Goals

**Goals:**
- `<CodeEditor>` accepts `lang?: "xml" | "json"` to select the CodeMirror language extension
- `<CodeEditor>` accepts `placeholder?: string` for empty-state hint text
- sampleData textarea is replaced with `<CodeEditor lang="json" placeholder='{ "name": "Alice" }' />`

**Non-Goals:**
- JSON schema validation / autocomplete
- Real-time error display for JSON parse failures (current behaviour — preview shows error — is unchanged)
- Any server-side change

## Decisions

**`lang` prop as string union, not LanguageSupport object**
Keeps the component's public API free of CodeMirror types. The component resolves the correct `LanguageSupport` internally based on the string value. Defaults to `"xml"` to keep existing MJML behaviour unchanged.

**`placeholder` via CodeMirror `placeholder()` from `@codemirror/view`**
`@codemirror/view` already exports `placeholder(text)` as a built-in extension — no additional package needed.

**sampleData wiring**
The sampleData field is wired via local state (`useState`), not react-hook-form. `<CodeEditor>` accepts `value` and `onChange`, so the replacement is:
```tsx
// Before
<Textarea value={sampleData} onChange={(e) => setSampleData(e.target.value)} />

// After
<CodeEditor lang="json" value={sampleData} onChange={setSampleData} placeholder='{ "name": "Alice" }' />
```

## Risks / Trade-offs

- [Additional package] `@codemirror/lang-json` is a small modular package; no meaningful bundle impact beyond what we already accepted for XML mode
- [lang default] Defaulting `lang` to `"xml"` means existing `<CodeEditor>` usages (MJML) require no change
