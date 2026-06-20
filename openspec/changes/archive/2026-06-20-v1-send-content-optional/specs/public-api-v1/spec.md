## CHANGED Requirements

### Requirement: POST /api/v1/send
The `content` field is OPTIONAL and defaults to `{}` when omitted. Callers whose templates contain no Handlebars variables MAY omit `content` entirely from the request body.
