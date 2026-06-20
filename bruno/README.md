# Mailer API v1 — Bruno Collection

Runnable examples for the Mailer public REST API using [Bruno](https://www.usebruno.com/).

## Prerequisites

- [Bruno desktop app](https://www.usebruno.com/downloads) (v1.x or later)
- A running Mailer instance (local or remote)
- An API token from Account Settings

## Setup

### 1. Open the collection

In Bruno: **File → Open Collection** → select the `bruno/` folder inside this repo.

### 2. Create a local environment file

Copy the example environment and fill in your values:

```bash
cp bruno/environments/local.example.bru bruno/environments/local.bru
```

Edit `bruno/environments/local.bru`:

```
vars {
  baseUrl: http://localhost:3000
  apiToken: <paste-your-token-here>
}
```

> `local.bru` is gitignored — your token will never be committed.

### 3. Get an API token

1. Log in to the Mailer web app
2. Go to **Account Settings → API Tokens**
3. Click **New Token**, give it a name, and copy the plaintext token shown — it is only displayed once

### 4. Select the environment

In Bruno's environment dropdown (top-right), select **local**.

## Requests

| Request | Description |
|---------|-------------|
| `Send Email` | `POST /api/v1/send` — send a transactional email using a named template |

### Send Email

Edit the request body to match your template and recipient:

```json
{
  "templateName": "Welcome Email",
  "to": "recipient@example.com",
  "content": {
    "firstName": "Alice"
  }
}
```

- `templateName` — exact name of a template in your account
- `to` — recipient email address (or an array of addresses)
- `content` — key/value pairs substituted into Handlebars variables in the template

Optional overrides (take precedence over template defaults):

```json
{
  "subject": "Custom subject",
  "fromName": "Custom Sender",
  "replyTo": "reply@example.com"
}
```

### Responses

| Status | Meaning |
|--------|---------|
| `200 { ok: true, messageId }` | Email delivered |
| `400 { ok: false, code, message }` | Delivery failure from the email provider |
| `401 { error: "Unauthorized" }` | Missing or invalid API token |
| `404 { error: "Template not found" }` | No template with that name in your account |
| `422 { error: "Validation failed", issues }` | Invalid request body |
