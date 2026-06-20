## Tasks

- [x] In `proxy.ts`, add `"/api/v1"` to the `PUBLIC_PATHS` array so that requests to `/api/v1/*` pass through the proxy without session-cookie auth checks
- [ ] Verify with Bruno (or curl) that `POST /api/v1/send` with a valid Bearer token returns JSON, not HTML
