import { SSO_BASE_URL } from "@/lib/constants";
import { SignInButton } from "@/features/auth/components/SignInButton";
import { t } from "@/utils/t";

export function LoginPage() {
  const ssoDomain = SSO_BASE_URL ? new URL(SSO_BASE_URL).hostname : "";

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 p-8">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">{t("auth.signInTitle")}</h1>
          <p className="text-muted-foreground">{t("auth.signInDescription")}</p>
        </div>
        <SignInButton domain={ssoDomain} />
      </div>
    </div>
  );
}
