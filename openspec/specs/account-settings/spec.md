# Spec: Account Settings

## Purpose

TBD — Defines the account settings page that displays the authenticated user's SSO profile and provides a layout for future settings subsections.

## Requirements

### Requirement: Account settings page displays SSO profile
The system SHALL provide an account settings page at `/settings` that shows the authenticated user's profile information sourced from the Better Auth session (name and email). The page SHALL source all display strings from `locales/en.json` via `t()`. The component SHALL live in `features/account/pages/AccountSettingsPage.tsx` and the route file `app/(authenticated)/settings/page.tsx` SHALL import from it.

#### Scenario: Authenticated user views settings
- **WHEN** an authenticated user navigates to `/settings`
- **THEN** the page renders their name and email as read-only fields within an "Account" section

#### Scenario: Session loading state
- **WHEN** the session query is still pending
- **THEN** skeleton placeholders are shown in place of the name and email values

### Requirement: Profile identity includes an initials avatar
The system SHALL render a circular avatar displaying the user's initials (first character of name, falling back to first character of email). The avatar SHALL be generated from CSS only — no external image requests.

#### Scenario: User has a name
- **WHEN** the session user object has a non-empty `name`
- **THEN** the avatar displays the first character of `name` in uppercase

#### Scenario: User has only email, no name
- **WHEN** the session user object has no `name` (null or empty string)
- **THEN** the avatar displays the first character of `email` in uppercase

### Requirement: Settings page provides a layout container for subsections
The system SHALL render the settings content using a vertical section layout that can accommodate additional subsections (e.g., API Tokens) without structural changes. Each subsection SHALL be visually separated and independently scrollable within the main content area.

#### Scenario: Account section is present
- **WHEN** an authenticated user views `/settings`
- **THEN** the page shows an "Account" section heading followed by the profile fields

### Requirement: API Tokens Section
The `/settings` page MUST include an "API Tokens" section that allows users to create, view, and revoke personal API tokens.

The section MUST display a list of the user's existing tokens. Each row MUST show the token name, a truncated prefix (first 8 characters), the last-used-at timestamp (or "Never" if unused), and a revoke button.

The section MUST include an inline form with a single name input and a "Create Token" button. On successful creation, the name input MUST clear and a reveal dialog MUST appear showing the plaintext token.

#### Scenario: User views token list
- **WHEN** the user navigates to `/settings`
- **THEN** the API Tokens section shows all their active tokens with name, prefix, and last-used-at

#### Scenario: User creates a token
- **WHEN** the user enters a token name and clicks "Create Token"
- **THEN** the token is created, the name field clears, and a modal shows the plaintext token with a copy button

#### Scenario: User dismisses the reveal dialog
- **WHEN** the user clicks "Done" in the reveal dialog
- **THEN** the dialog closes and the plaintext token is no longer visible anywhere in the UI

#### Scenario: User revokes a token
- **WHEN** the user clicks the revoke button on a token row
- **THEN** the token is deleted and disappears from the list immediately

#### Scenario: No tokens exist
- **WHEN** the user has no active tokens
- **THEN** the section shows an empty state message in place of the list
