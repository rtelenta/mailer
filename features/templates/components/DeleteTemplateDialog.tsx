"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useDeleteTemplate } from "@/features/templates/hooks/useDeleteTemplate";
import { t } from "@/utils/t";
import { Trash2Icon } from "lucide-react";

interface DeleteTemplateDialogProps {
  templateId: string;
  templateName: string;
}

export function DeleteTemplateDialog({
  templateId,
  templateName,
}: DeleteTemplateDialogProps) {
  const { mutate: deleteTemplate, isPending } = useDeleteTemplate();

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="ghost" size="sm" aria-label={`Delete ${templateName}`} />
        }
      >
        <Trash2Icon data-icon="inline-start" />
        {t("common.delete")}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("templates.delete.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("templates.delete.descriptionPrefix")} &ldquo;{templateName}&rdquo;.{" "}
            {t("templates.delete.descriptionSuffix")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("templates.delete.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteTemplate(templateId)}
            disabled={isPending}
          >
            {isPending && <Spinner data-icon="inline-start" />}
            {t("templates.delete.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
