## 1. CreateTemplateSheet

- [x] 1.1 Import `useRouter` from `next/navigation` in `features/templates/components/CreateTemplateSheet.tsx`
- [x] 1.2 Call `router.push(\`/templates/${created.id}/edit\`)` in the `onSuccess` callback after `reset()` and `setOpen(false)`, using the `created` `TemplateRecord` argument

## 2. Spec Update

- [x] 2.1 Update `openspec/specs/template-management/spec.md` UR-2 to note that on successful submission the sheet closes and the user is redirected to `/templates/:id/edit`
