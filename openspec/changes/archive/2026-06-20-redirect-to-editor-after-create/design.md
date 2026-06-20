## Context

`CreateTemplateSheet` calls `createTemplate(data, { onSuccess: () => { reset(); setOpen(false); } })`. The mutation's `onSuccess` receives the created `TemplateRecord` as its first argument (per TanStack Query's `MutationOptions.onSuccess` signature: `onSuccess(data, variables, context)`). The record includes `id`, which is all that's needed to construct the redirect URL.

Navigation in this codebase uses `useRouter` from `next/navigation` with `router.push(path)`.

## Goals / Non-Goals

**Goals:**
- Redirect to `/templates/:id/edit` immediately after create succeeds
- Keep `reset()` and `setOpen(false)` calls so the sheet state is clean before navigation

**Non-Goals:**
- Any back-navigation override (browser back returns to the list naturally)
- Loading state changes (the existing spinner/disabled pattern is sufficient)

## Decision

**`router.push` in the sheet's `onSuccess` callback, receiving `created` from TanStack Query**

```tsx
const router = useRouter();

createTemplate(data, {
  onSuccess: (created) => {
    reset();
    setOpen(false);
    router.push(`/templates/${created.id}/edit`);
  },
});
```

The mutation already resolves with `TemplateRecord` (typed), so `created.id` is type-safe with no extra cast.

`reset()` and `setOpen(false)` run before the push so the sheet is in a clean state if the user navigates back.
