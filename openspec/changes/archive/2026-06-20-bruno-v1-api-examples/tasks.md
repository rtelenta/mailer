## 1. Collection Setup

- [x] 1.1 Create `bruno/` directory at repo root with `bruno.json` (collection manifest naming the collection "Mailer API v1")
- [x] 1.2 Create `bruno/environments/local.example.bru` containing placeholder variables: `baseUrl = http://localhost:3000`, `apiToken = <your-api-token>`
- [x] 1.3 Add `bruno/environments/local.bru` to `.gitignore` so real secrets are never committed

## 2. Request Files

- [x] 2.1 Create `bruno/send-email.bru` — `POST {{baseUrl}}/api/v1/send` with `Authorization: Bearer {{apiToken}}` header and a JSON body example covering `templateName`, `to`, and `content`

## 3. Documentation

- [x] 3.1 Create `bruno/README.md` explaining: (1) how to open the collection in the Bruno desktop app, (2) how to create an API token in Account Settings and set it in `environments/local.bru`, (3) how to run the send request
