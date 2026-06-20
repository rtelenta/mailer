# Delta: email-delivery

## FR-3: Template Defaults

REMOVE the `preheader` field from the `defaults` object. The updated list of defaults is: `subject`, `fromName`, `fromAddress`, `replyTo`.

## Interface Contract

UPDATE `EmailDefaults` — remove `preheader?: string`:

```ts
interface EmailDefaults {
  subject: string;
  fromName: string;
  fromAddress: string;
  replyTo?: string;
}
```
