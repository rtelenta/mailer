"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { t } from "@/utils/t";
import { TriangleAlertIcon } from "lucide-react";

interface TemplatePreviewPaneProps {
  html: string;
  compilationError: string | null;
}

export function TemplatePreviewPane({ html, compilationError }: TemplatePreviewPaneProps) {
  if (compilationError) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertTitle>{t("templateEditor.preview.errorTitle")}</AlertTitle>
          <AlertDescription>
            <pre className="text-xs whitespace-pre-wrap">{compilationError}</pre>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!html) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-sm text-muted-foreground">
        {t("templateEditor.preview.emptyState")}
      </div>
    );
  }

  return (
    <iframe
      srcDoc={html}
      sandbox=""
      title={t("templateEditor.preview.title")}
      className="w-full h-full border-0"
    />
  );
}
