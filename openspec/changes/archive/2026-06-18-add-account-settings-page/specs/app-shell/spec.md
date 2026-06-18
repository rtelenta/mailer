## MODIFIED Requirements

### Requirement: Stub pages exist for Dashboard and Templates
The system SHALL provide minimal stub page components for `/dashboard` and `/templates` so that the sidebar navigation links resolve without 404 errors. Each stub page SHALL render a heading identifying the section. All heading text SHALL use `t()`. The `/settings` route is no longer a stub — it is fulfilled by the `account-settings` capability.

#### Scenario: User navigates to a stub page
- **WHEN** an authenticated user clicks a nav link for Dashboard or Templates
- **THEN** the target page renders without error and displays a section heading

#### Scenario: Non-existent authenticated route
- **WHEN** an authenticated user navigates to an unknown path under the authenticated group (e.g., `/foobar`)
- **THEN** Next.js returns a 404 response (no shell layout is rendered for unknown routes)
