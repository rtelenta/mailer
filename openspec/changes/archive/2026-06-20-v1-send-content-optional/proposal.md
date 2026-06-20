---
title: Make content field visibly optional in v1/send API
type: refactor
status: proposed
---

## Problem

The `content` field in `POST /api/v1/send` is already optional in the Zod schema (`z.record(...).optional().default({})`), so callers can omit it and it defaults to `{}`. However:

1. The Bruno collection's example body always includes `content`, implying it is required.
2. The spec doesn't explicitly document that `content` is optional or what its default is.

This causes confusion for callers whose templates have no Handlebars variables — they may think they must send `content: {}` even when they have nothing to interpolate.

## Proposed Change

Update the Bruno example and the spec to make the optional nature of `content` visible:

- **Bruno (`send-email.bru`)**: Move `content` to a commented-out block or provide a minimal example without it, so callers know it can be omitted for templates with no variables.
- **Spec**: Add an explicit note that `content` is optional and defaults to `{}`.

No code change to `lib/api/v1.ts` is needed — the Zod schema is already correct.

## Scope

- `bruno/send-email.bru` — update example body to show `content` is optional
- `openspec/specs/public-api-v1/spec.md` (delta spec) — document `content` default
