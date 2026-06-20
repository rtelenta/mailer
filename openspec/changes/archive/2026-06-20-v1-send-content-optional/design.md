---
title: Design — v1/send content optional
---

## What changes

### `bruno/send-email.bru`

Remove `content` from the default body and add it as a Bruno comment so callers see it's available but not required:

```bru
body:json {
  {
    "templateName": "Welcome Email",
    "to": "recipient@example.com"
  }
}

// Include "content" when your template has Handlebars variables:
// body:json {
//   {
//     "templateName": "Welcome Email",
//     "to": "recipient@example.com",
//     "content": {
//       "firstName": "Alice",
//       "productName": "Mailer"
//     }
//   }
// }
```

> Note: Bruno's comment syntax is `//` inside `.bru` files. Comments on their own lines are ignored by the runner.

### Delta spec (`specs/public-api-v1/spec.md`)

Add a clarification to the `POST /api/v1/send` requirement that `content` is optional and defaults to `{}`.

## What is NOT changing

- `lib/api/v1.ts` Zod schema — `content` is already `.optional().default({})`, no change needed
- `bruno/README.md` — no change needed; the request file itself makes it clear
- Auth, routing, or any other behavior
