"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useApiTokens } from "@/features/account/hooks/useApiTokens";
import { useCreateApiToken } from "@/features/account/hooks/useCreateApiToken";
import { useRevokeApiToken } from "@/features/account/hooks/useRevokeApiToken";
import { t } from "@/utils/t";

function formatLastUsed(lastUsedAt: string | null): string {
  if (!lastUsedAt) return t("account.apiTokens.never");
  return new Date(lastUsedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function TokenRevealDialog({
  plaintext,
  onClose,
}: {
  plaintext: string;
  onClose: () => void;
}) {
  function handleCopy() {
    navigator.clipboard.writeText(plaintext).then(() => {
      toast.success(t("account.apiTokens.reveal.copied"));
    });
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t("account.apiTokens.reveal.title")}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {t("account.apiTokens.reveal.instructions")}
        </p>
        <code className="block rounded bg-muted px-3 py-2 font-mono text-xs break-all select-all">
          {plaintext}
        </code>
        <DialogFooter>
          <Button variant="outline" onClick={handleCopy}>
            {t("account.apiTokens.reveal.copy")}
          </Button>
          <Button onClick={onClose}>
            {t("account.apiTokens.reveal.done")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ApiTokensSection() {
  const { data: tokens, isLoading } = useApiTokens();
  const { mutate: createToken, isPending: isCreating } = useCreateApiToken();
  const { mutate: revokeToken, isPending: isRevoking } = useRevokeApiToken();

  const [name, setName] = useState("");
  const [revealPlaintext, setRevealPlaintext] = useState<string | null>(null);

  function handleCreate() {
    if (!name.trim()) return;
    createToken(name.trim(), {
      onSuccess: (result) => {
        setName("");
        setRevealPlaintext(result.plaintext);
      },
      onError: () => {
        toast.error(t("account.apiTokens.createError"));
      },
    });
  }

  function handleRevoke(id: string) {
    revokeToken(id, {
      onSuccess: () => {
        toast.success(t("account.apiTokens.revokeSuccess"));
      },
      onError: () => {
        toast.error(t("account.apiTokens.revokeError"));
      },
    });
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-2/3" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {revealPlaintext && (
        <TokenRevealDialog
          plaintext={revealPlaintext}
          onClose={() => setRevealPlaintext(null)}
        />
      )}

      {tokens && tokens.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("account.apiTokens.columns.name")}</TableHead>
              <TableHead>{t("account.apiTokens.columns.prefix")}</TableHead>
              <TableHead>{t("account.apiTokens.columns.lastUsed")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.map((token) => (
              <TableRow key={token.id}>
                <TableCell className="font-medium">{token.name}</TableCell>
                <TableCell>
                  <code className="font-mono text-xs text-muted-foreground">
                    {token.tokenPrefix}…
                  </code>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatLastUsed(token.lastUsedAt)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isRevoking}
                    onClick={() => handleRevoke(token.id)}
                  >
                    {t("account.apiTokens.revoke")}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{t("account.apiTokens.emptyTitle")}</EmptyTitle>
            <EmptyDescription>
              {t("account.apiTokens.emptyDescription")}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      <div className="flex gap-2">
        <Field className="flex-1">
          <FieldLabel className="sr-only">
            {t("account.apiTokens.create.label")}
          </FieldLabel>
          <Input
            placeholder={t("account.apiTokens.create.placeholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
            disabled={isCreating}
          />
        </Field>
        <Button
          type="button"
          disabled={isCreating || !name.trim()}
          onClick={handleCreate}
        >
          {isCreating && <Spinner data-icon="inline-start" />}
          {isCreating
            ? t("account.apiTokens.create.creating")
            : t("account.apiTokens.create.button")}
        </Button>
      </div>
    </div>
  );
}
