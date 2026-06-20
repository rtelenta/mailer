# Proposal: MJML Editor Upgrade

## What

Remove the MJML source textarea from the template creation form and replace the plain textarea in the template editor page with a proper code editor component.

## Why

The MJML source field in the creation form is out of place — users can't meaningfully author MJML at template creation time (no live preview, no formatting aids). The field being optional already signals that the right place to write MJML is the dedicated editor page. Removing it from creation simplifies the form and sets a cleaner mental model: create the template header fields, then go to the editor to write the MJML.

In the editor page, a plain `<textarea>` is a poor fit for authoring MJML. MJML is XML-based markup and users benefit from syntax highlighting, proper indentation display, and line numbers. A code editor component (CodeMirror 6) solves this with minimal bundle overhead and good XML/HTML language support.

## Scope

- **CreateTemplateSheet**: remove the MJML `<Field>` block (already optional; server already defaults to `""` when absent)
- **TemplateEditorPage**: swap the `<Textarea>` for a CodeMirror 6 editor with XML syntax highlighting
- Install `@codemirror/view`, `@codemirror/state`, `@codemirror/lang-xml`, `@codemirror/theme-one-dark` (or similar minimal theme)
- Update `mjml-template-editor` spec to reflect the code editor requirement and remove the textarea reference

## Out of Scope

- MJML autocomplete or schema-aware completion
- Any change to the API contract or database schema
- The sample-data JSON input field (stays as-is)
