## Why

After login the app renders a blank screen — there is no persistent layout, no navigation, and no way to reach any section of the product. This change adds the authenticated shell that all future feature pages will live inside.

## What Changes

- New root authenticated layout wrapping all protected routes with a sidebar and header
- Sidebar with nav links to Dashboard, Templates, and Settings (stubs acceptable for non-existent pages)
- Header displaying the logged-in user's name/email, fetched from the session
- Functional logout button wired to better-auth's sign-out endpoint
- Placeholder page components for `/dashboard`, `/templates`, and `/settings` so nav links are valid routes

## Capabilities

### New Capabilities

- `app-shell`: Persistent authenticated layout — sidebar navigation, user header, and logout. Wraps all protected routes via a Next.js layout component.

### Modified Capabilities

_(none — logout behaviour is already specified in `sso-auth`; this change only adds the UI surface that calls it)_

## Impact

- **UI**: New `app/(authenticated)/layout.tsx` layout, sidebar component, header component; stub pages for dashboard, templates, settings
- **API**: No new endpoints; consumes existing `GET /api/auth/get-session`
- **DB**: None
- **Dependencies**: None new — uses shadcn/ui, TanStack Query, better-auth client already in the stack
- **Environment variables**: None new

## Non-goals

- Actual implementation of Dashboard, Templates, or Settings pages
- Role-based access or team/org features — individual users only
- Mobile-responsive collapsible sidebar (can be added later)
- Notification system, breadcrumbs, or search
