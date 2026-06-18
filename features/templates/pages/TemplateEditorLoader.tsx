"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const TemplateEditorPage = dynamic(
  () =>
    import("@/features/templates/pages/TemplateEditorPage").then(
      (m) => m.TemplateEditorPage
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col gap-4 p-4">
        <Skeleton className="h-12 w-full" />
        <div className="flex gap-0 h-[calc(100vh-12rem)]">
          <Skeleton className="h-full flex-1 rounded-r-none" />
          <Skeleton className="h-full flex-1 rounded-l-none" />
        </div>
      </div>
    ),
  }
);

export function TemplateEditorLoader({ id }: { id: string }) {
  return <TemplateEditorPage id={id} />;
}
