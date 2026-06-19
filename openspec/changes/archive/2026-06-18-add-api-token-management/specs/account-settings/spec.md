## MODIFIED Requirements

### Requirement: API Tokens Section
The `/settings` page MUST include an "API Tokens" section that allows users to create, view, and revoke personal API tokens.

The section MUST display a list of the user's existing tokens. Each row MUST show the token name, a truncated prefix (first 8 characters), the last-used-at timestamp (or "Never" if unused), and a revoke button.

The section MUST include an inline form with a single name input and a "Create Token" button. On successful creation, the name input MUST clear and a reveal dialog MUST appear showing the plaintext token.

The previous "coming soon" placeholder text for the API Tokens section is removed.

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
