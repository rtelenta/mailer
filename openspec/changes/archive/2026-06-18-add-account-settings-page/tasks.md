## 1. Locales

- [x] 1.1 Add `account.title`, `account.sections.account`, `account.sections.apiTokens`, `account.sections.apiTokensComingSoon`, `account.profile.name`, `account.profile.email` keys to `locales/en.json`

## 2. Profile Avatar Component

- [x] 2.1 Create `features/account/components/ProfileAvatar.tsx` — a circular avatar that derives initials from `name` (first char) falling back to `email` (first char), uppercase; CSS-only, no image requests

## 3. Account Settings Page

- [x] 3.1 Create `features/account/pages/AccountSettingsPage.tsx` — `"use client"` component; uses `useSession()` from `features/shell/hooks/useSession`; renders page heading, Account section with `ProfileAvatar` + name + email read-only fields, API Tokens stub section
- [x] 3.2 Add skeleton placeholders (inline `animate-pulse` divs) shown while `isLoading` is true for name, email, and avatar

## 4. Route Wiring

- [x] 4.1 Delete `features/shell/pages/SettingsPage.tsx` (the old stub)
- [x] 4.2 Update `app/(authenticated)/settings/page.tsx` to import `AccountSettingsPage` from `features/account/pages/AccountSettingsPage`

## 5. TypeScript Check

- [x] 5.1 Run `bun run tsc --noEmit` and resolve any type errors
