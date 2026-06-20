## MODIFIED Requirements

### Requirement: from header uses RFC 2822 quoted-string display name
`sendEmail` (via the Resend provider) MUST construct the `from` header as `"<fromName>" <fromAddress>` (display name wrapped in double-quotes). Plain unquoted concatenation is NOT acceptable because RFC 2822 special characters in the name produce an invalid address header.

#### Scenario: fromName contains a comma
- **WHEN** `fromName` is `"Acme, Inc."` and `fromAddress` is `noreply@example.com`
- **THEN** the Resend API call MUST receive `from: '"Acme, Inc." <noreply@example.com>'`

### Requirement: replyTo uses SDK camelCase key
The Resend provider MUST pass the reply-to address using the Resend SDK v6 camelCase parameter `replyTo`, not the snake_case API field `reply_to`. Using `reply_to` directly on the SDK input object causes the value to be silently dropped.

#### Scenario: template has a replyTo address
- **WHEN** a template has a `replyTo` address set
- **THEN** the outgoing email MUST include that address in the `Reply-To` header
