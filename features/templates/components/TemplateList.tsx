"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteTemplateDialog } from "@/features/templates/components/DeleteTemplateDialog";
import { useTemplates } from "@/features/templates/hooks/useTemplates";
import { t } from "@/utils/t";
import { MailIcon } from "lucide-react";

function TemplateSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell />
    </TableRow>
  );
}

export function TemplateList() {
  const { data: templates, isLoading } = useTemplates();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("templates.columns.name")}</TableHead>
          <TableHead>{t("templates.columns.subject")}</TableHead>
          <TableHead>{t("templates.columns.fromName")}</TableHead>
          <TableHead>{t("templates.columns.createdAt")}</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading && (
          <>
            <TemplateSkeleton />
            <TemplateSkeleton />
            <TemplateSkeleton />
          </>
        )}
        {!isLoading && templates?.length === 0 && (
          <TableRow>
            <TableCell colSpan={5}>
              <Empty>
                <EmptyMedia>
                  <MailIcon />
                </EmptyMedia>
                <EmptyTitle>{t("templates.title")}</EmptyTitle>
                <EmptyDescription>{t("templates.emptyState")}</EmptyDescription>
              </Empty>
            </TableCell>
          </TableRow>
        )}
        {templates?.map((template) => (
          <TableRow key={template.id}>
            <TableCell className="font-medium">{template.name}</TableCell>
            <TableCell className="text-muted-foreground">{template.subject}</TableCell>
            <TableCell className="text-muted-foreground">{template.fromName}</TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(template.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              <DeleteTemplateDialog
                templateId={template.id}
                templateName={template.name}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
