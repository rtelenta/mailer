# Proposal: Redirect to Editor After Template Creation

## What

After a template is successfully created via the create-template sheet, automatically redirect the user to the template editor page (`/templates/:id/edit`) instead of just closing the sheet.

## Why

Currently, the post-create UX leaves the user on the templates list page after the sheet closes. The next natural step is almost always to write MJML — which requires navigating to the editor manually. Redirecting immediately removes that friction and gives users a fast path from "create" to "write content".

The created template's `id` is already available in the `onSuccess` callback (the mutation resolves with the full `TemplateRecord`), so no additional fetch or state is needed.

## Scope

- In `features/templates/components/CreateTemplateSheet.tsx`: add `useRouter` and call `router.push(\`/templates/${created.id}/edit\`)` in the `onSuccess` callback, after `reset()` and `setOpen(false)`
- Update `template-management` spec UR-2 to reflect the post-create redirect behaviour

## Out of Scope

- Any change to the API or server-side
- Changing the list page query invalidation (still happens via `useCreateTemplate`'s `onSuccess`)
