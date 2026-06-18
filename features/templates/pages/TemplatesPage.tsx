"use client";

import { TemplateList } from "@/features/templates/components/TemplateList";
import { CreateTemplateSheet } from "@/features/templates/components/CreateTemplateSheet";
import { t } from "@/utils/t";

export function TemplatesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("templates.title")}</h1>
        <CreateTemplateSheet />
      </div>
      <TemplateList />
    </div>
  );
}
