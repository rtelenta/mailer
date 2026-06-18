"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { t } from "@/utils/t";
import { useSession } from "../hooks/useSession";

export function AppHeader() {
  const router = useRouter();
  const { user, isLoading } = useSession();

  async function handleLogout() {
    await authClient.signOut();
    router.push("/login");
  }

  return (
    <header className="flex h-12 shrink-0 items-center justify-end gap-3 border-b border-border bg-background px-4">
      {isLoading ? (
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      ) : (
        <span className="text-sm text-muted-foreground">
          {user?.name ?? user?.email ?? ""}
        </span>
      )}
      <Button
        variant="ghost"
        size="sm"
        disabled={isLoading}
        onClick={handleLogout}
      >
        {t("shell.header.logout")}
      </Button>
    </header>
  );
}
