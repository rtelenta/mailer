## ADDED Requirements

### Requirement: Authenticated routes share a persistent shell layout
The system SHALL have a Next.js route group `app/(authenticated)/` with a `layout.tsx` that renders a full-height two-column shell: a fixed sidebar on the left and a scrollable main content area on the right. All protected page routes (dashboard, templates, settings) SHALL be placed under this route group. The root layout (`app/layout.tsx`) SHALL NOT be changed — it continues to provide fonts and dark-mode to all routes including `/login`.

#### Scenario: Authenticated user navigates to a protected page
- **WHEN** an authenticated user navigates to `/dashboard`, `/templates`, or `/settings`
- **THEN** the page is rendered inside the shell layout with the sidebar and header visible

#### Scenario: Login page is not wrapped by the shell
- **WHEN** any user navigates to `/login`
- **THEN** the sidebar and shell header are NOT rendered — only the root layout and login page render

### Requirement: Sidebar displays navigation links to all main sections
The system SHALL render a sidebar component (`features/shell/components/AppSidebar.tsx`) with navigation links to Dashboard (`/dashboard`), Templates (`/templates`), and Settings (`/settings`). The active link SHALL be visually distinguished based on the current pathname. All link labels SHALL be sourced from `locales/en.json` via `t()`.

#### Scenario: User views the sidebar
- **WHEN** an authenticated user is on any protected page
- **THEN** the sidebar shows links labeled according to `locales/en.json` for Dashboard, Templates, and Settings

#### Scenario: Active nav link is highlighted
- **WHEN** the user is on `/templates`
- **THEN** the Templates link in the sidebar appears in the active/selected state and the other links do not

### Requirement: Header displays the logged-in user's identity
The system SHALL render a header component (`features/shell/components/AppHeader.tsx`) that fetches the current session from `GET /api/auth/get-session` via TanStack Query and displays the user's name or email. While the session is loading, a skeleton placeholder SHALL be shown in place of the user identity. All visible strings (loading state label, aria labels) SHALL use `t()`.

#### Scenario: Session resolves successfully
- **WHEN** the session query returns a user object
- **THEN** the header displays the user's name (falling back to email if name is absent)

#### Scenario: Session is loading
- **WHEN** the session query is in a pending state
- **THEN** the header renders a skeleton element in place of the user identity text

### Requirement: Header logout button signs the user out
The system SHALL render a logout button in the header. Clicking it SHALL call `authClient.signOut()` (better-auth browser client) which POSTs to `POST /api/auth/sign-out`. On successful sign-out the user SHALL be redirected to `/login`. The logout button label SHALL use `t()`.

#### Scenario: User clicks logout
- **WHEN** an authenticated user clicks the logout button in the header
- **THEN** `authClient.signOut()` is called, the session is destroyed, and the browser navigates to `/login`

#### Scenario: Logout while session is loading
- **WHEN** the session is still loading (pending state)
- **THEN** the logout button is disabled until the session resolves

### Requirement: Root path redirects to dashboard
The system SHALL redirect navigations to `/` to `/dashboard` using a permanent redirect. This replaces the current blank `app/page.tsx`.

#### Scenario: Authenticated user navigates to root
- **WHEN** a user with a valid session navigates to `/`
- **THEN** the browser is redirected to `/dashboard`

### Requirement: Stub pages exist for Dashboard, Templates, and Settings
The system SHALL provide minimal page components for `/dashboard`, `/templates`, and `/settings` so that the sidebar navigation links resolve without 404 errors. Each stub page SHALL render a heading identifying the section. All heading text SHALL use `t()`.

#### Scenario: User navigates to a stub page
- **WHEN** an authenticated user clicks a nav link for Dashboard, Templates, or Settings
- **THEN** the target page renders without error and displays a section heading

#### Scenario: Non-existent authenticated route
- **WHEN** an authenticated user navigates to an unknown path under the authenticated group (e.g., `/foobar`)
- **THEN** Next.js returns a 404 response (no shell layout is rendered for unknown routes)
