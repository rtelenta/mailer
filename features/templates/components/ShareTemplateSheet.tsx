"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { FieldGroup, Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { useTemplateShares } from "@/features/templates/hooks/useTemplateShares";
import { useAddShare } from "@/features/templates/hooks/useAddShare";
import { useRemoveShare } from "@/features/templates/hooks/useRemoveShare";
import { t } from "@/utils/t";
import { ShareIcon, Trash2Icon } from "lucide-react";

interface Props {
  templateId: string;
  isOwner: boolean;
}

export function ShareTemplateSheet({ templateId, isOwner }: Props) {
  const [email, setEmail] = useState("");
  const [addError, setAddError] = useState<string | null>(null);

  const { data: shares = [], isLoading } = useTemplateShares(templateId);
  const addShare = useAddShare(templateId);
  const removeShare = useRemoveShare(templateId);

  function handleAdd() {
    setAddError(null);
    addShare.mutate(
      { email },
      {
        onSuccess: () => setEmail(""),
        onError: (err) => setAddError(err.message),
      }
    );
  }

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="outline" size="sm">
            <ShareIcon data-icon="inline-start" />
            {t("templateSharing.share")}
          </Button>
        }
      />
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t("templateSharing.title")}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 p-4">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          ) : shares.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("templateSharing.noCollaborators")}
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {shares.map((collaborator) => (
                <li
                  key={collaborator.userId}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">
                      {collaborator.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {collaborator.email}
                    </span>
                  </div>
                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={t("templateSharing.removeCollaborator")}
                      disabled={removeShare.isPending}
                      onClick={() => removeShare.mutate(collaborator.userId)}
                    >
                      <Trash2Icon data-icon="inline-start" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {isOwner && (
            <>
              <Separator />
              <FieldGroup>
                <Field data-invalid={!!addError || undefined}>
                  <FieldLabel htmlFor="share-email">
                    {t("templateSharing.addCollaborator.label")}
                  </FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      id="share-email"
                      type="email"
                      placeholder={t("templateSharing.addCollaborator.placeholder")}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setAddError(null);
                      }}
                      aria-invalid={!!addError}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAdd();
                      }}
                    />
                    <Button
                      onClick={handleAdd}
                      disabled={!email || addShare.isPending}
                    >
                      {addShare.isPending ? (
                        <Spinner />
                      ) : (
                        t("templateSharing.addCollaborator.add")
                      )}
                    </Button>
                  </div>
                  {addError && (
                    <FieldDescription className="text-destructive">
                      {addError}
                    </FieldDescription>
                  )}
                </Field>
              </FieldGroup>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
