## CHANGED Requirements

### Requirement: POST /api/v1/send
The existing requirement is clarified: the v1 API path `/api/v1/*` MUST be excluded from session-cookie authentication enforced by the Next.js proxy. Requests to `/api/v1/*` are authenticated exclusively by Bearer API token within the route handler. The proxy MUST NOT redirect these requests to the login page.
