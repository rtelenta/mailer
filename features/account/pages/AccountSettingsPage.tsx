"use client";

import { ProfileAvatar } from "@/features/account/components/ProfileAvatar";
import { ApiTokensSection } from "@/features/account/components/ApiTokensSection";
import { useSession } from "@/features/shell/hooks/useSession";
import { t } from "@/utils/t";

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-border pb-8 last:border-b-0">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

function ProfileField({
  label,
  value,
  loading,
}: {
  label: string;
  value: string | null | undefined;
  loading: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      {loading ? (
        <div className="h-5 w-48 animate-pulse rounded bg-muted" />
      ) : (
        <span className="text-sm">{value ?? "—"}</span>
      )}
    </div>
  );
}

export function AccountSettingsPage() {
  const { user, isLoading } = useSession();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-semibold">{t("account.title")}</h1>

      <SettingsSection title={t("account.sections.account")}>
        <div className="flex items-start gap-4">
          {isLoading ? (
            <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
          ) : (
            <ProfileAvatar name={user?.name} email={user?.email} />
          )}
          <div className="flex flex-col gap-3">
            <ProfileField
              label={t("account.profile.name")}
              value={user?.name}
              loading={isLoading}
            />
            <ProfileField
              label={t("account.profile.email")}
              value={user?.email}
              loading={isLoading}
            />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title={t("account.sections.apiTokens")}>
        <ApiTokensSection />
      </SettingsSection>
    </div>
  );
}
