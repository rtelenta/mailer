# Delta: template-management

## FR-1: Create Template

UPDATE the `mjml` field to be optional in the create request:

- The system MUST accept a create request with the following fields: `name` (required), `subject` (required), `fromName` (required), `replyTo` (optional), `mjml` (optional, max 500,000 chars)
- When `mjml` is omitted, the system MUST store an empty string `""` for the field

## Interface Contract — POST /api/templates

UPDATE `CreateTemplateInput`:

```ts
interface CreateTemplateInput {
  name: string;          // non-empty, max 255 chars
  subject: string;       // non-empty, max 998 chars
  fromName: string;      // non-empty, max 255 chars
  replyTo?: string;      // optional valid email address
  mjml?: string;         // optional, max 500,000 chars; defaults to "" when absent
}
```
