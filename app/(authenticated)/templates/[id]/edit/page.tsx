import { TemplateEditorLoader } from "@/features/templates/pages/TemplateEditorLoader";

export default async function TemplateEditorRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TemplateEditorLoader id={id} />;
}
