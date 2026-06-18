## Why

After login the shell is live but the Settings route is a blank stub. Users need a place to view their SSO profile and, in future changes, manage API tokens and other account preferences. This change fills that stub with a real account settings page.

## What Changes

- Replace the stub `SettingsPage` with a real account settings layout using a tabbed or sectioned structure, starting with an "Account" section
- Display read-only SSO profile information (name, email, avatar/initials) sourced from the existing `useSession` hook
- Add a placeholder "API Tokens" section stub so the container is ready for the next change
- Add any future-proofed UI layout (section nav inside settings) that prevents re-structuring when new subsections arrive

## Capabilities

### New Capabilities

- `account-settings`: Read-only account settings page showing SSO profile info; container layout for subsections (API tokens, etc.)

### Modified Capabilities

- `app-shell`: Settings nav target now resolves to a real page instead of a stub

## Impact

- UI only — no API, DB schema, or environment variable changes
- Touches `features/shell/pages/SettingsPage.tsx` (replaced) and likely adds `features/account/` domain
- No public send API changes; no breaking changes

## Non-goals

- Editing profile fields (SSO is the source of truth; this app is read-only)
- API token CRUD (arrives in a later change)
- Notification preferences or app-level theming controls
