# API Reference 📡

Mailer exposes a v1 HTTP API for sending emails programmatically using your saved templates.

## Authentication 🔑

All v1 API requests require a Bearer token. Generate one from **Settings → API Tokens** in the UI.

```
Authorization: Bearer <your-api-token>
```

Tokens are scoped to your account. They have access to all templates you own.

## Endpoints

### POST /api/v1/send

Send an email using a saved template.

**Headers**

| Header          | Value                        |
| --------------- | ---------------------------- |
| `Authorization` | `Bearer <your-api-token>`    |
| `Content-Type`  | `application/json`           |

**Body**

| Field          | Type                       | Required | Description                                                            |
| -------------- | -------------------------- | -------- | ---------------------------------------------------------------------- |
| `templateName` | `string`                   | ✅       | Name of the template to use (must be owned by the token's account)     |
| `to`           | `string \| string[]`       | ✅       | Recipient email address, or array of addresses for batch sending       |
| `content`      | `object`                   |          | Key/value pairs injected into Handlebars template variables            |
| `subject`      | `string`                   |          | Override the template's default subject line                           |
| `fromName`     | `string`                   |          | Override the template's default sender name                            |
| `replyTo`      | `string`                   |          | Override the template's default reply-to address                       |

**Single recipient**

```bash
curl -X POST https://mailer.localhost:3006/api/v1/send \
  -H "Authorization: Bearer <your-api-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "templateName": "welcome-email",
    "to": "user@example.com",
    "content": {
      "firstName": "Ada",
      "confirmationUrl": "https://yourapp.com/confirm/abc123"
    }
  }'
```

**Batch recipients**

```bash
curl -X POST https://mailer.localhost:3006/api/v1/send \
  -H "Authorization: Bearer <your-api-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "templateName": "newsletter-june",
    "to": ["alice@example.com", "bob@example.com"],
    "subject": "June Newsletter"
  }'
```

**Success response** `200 OK`

```json
{
  "ok": true,
  "messageId": "msg_xxxxxxxxxxxxxxxx"
}
```

**Error responses**

| Status | `code`             | Cause                                     |
| ------ | ------------------ | ----------------------------------------- |
| `401`  | —                  | Missing or invalid API token              |
| `404`  | —                  | Template not found or not owned by token  |
| `422`  | —                  | Request body failed validation            |
| `400`  | `RESEND_ERROR`     | Resend rejected the send request          |
| `400`  | `RENDER_ERROR`     | Template failed to compile (MJML error)   |

**Validation error response** `422 Unprocessable Entity`

```json
{
  "error": "Validation failed",
  "issues": [
    {
      "path": ["to"],
      "message": "Invalid email"
    }
  ]
}
```

**Send error response** `400 Bad Request`

```json
{
  "ok": false,
  "code": "RESEND_ERROR",
  "message": "The from address is not verified."
}
```

## Bruno Collection 🐻

The `bruno/` folder in the repository contains a ready-to-run API collection for [Bruno](https://www.usebruno.com/). It includes an example send request pre-configured with a Bearer token variable.

1. Open Bruno and import the `bruno/` folder as a collection.
2. Select the `local` environment.
3. Set your API token in the environment variables.
4. Run the **Send Email** request.
