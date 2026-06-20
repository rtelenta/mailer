# Delta: mjml-template-editor

## Template Settings Form

REMOVE the `preheader` field from the template editor settings form. This includes:
- The Zod schema field
- The `useForm` default value
- The `<Field>` block (label, input, error message)
- The field in the mutation payload

## Create Template Sheet

REMOVE the `preheader` field from the create-template sheet form. Same scope as above.

## Translations

REMOVE the translation keys:
- `templateEditor.fields.preheader`
- `templates.create.fields.preheader`
