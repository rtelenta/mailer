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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteTemplateDialog } from "@/features/templates/components/DeleteTemplateDialog";
import { useTemplates } from "@/features/templates/hooks/useTemplates";
import { t } from "@/utils/t";
import Link from "next/link";
import { MailIcon, PencilIcon } from "lucide-react";

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
            <TableCell className="font-medium">
              <span className="flex items-center gap-2">
                {template.name}
                {template.role === "collaborator" && (
                  <Badge variant="secondary">{t("templateSharing.sharedBadge")}</Badge>
                )}
              </span>
            </TableCell>
            <TableCell className="text-muted-foreground">{template.subject}</TableCell>
            <TableCell className="text-muted-foreground">{template.fromName}</TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(template.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  nativeButton={false}
                  render={
                    <Link
                      href={`/templates/${template.id}/edit`}
                      aria-label={`Edit ${template.name}`}
                    />
                  }
                >
                  <PencilIcon data-icon="inline-start" />
                  Edit
                </Button>
                {template.role === "owner" && (
                  <DeleteTemplateDialog
                    templateId={template.id}
                    templateName={template.name}
                  />
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
