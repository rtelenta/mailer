"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { t } from "@/utils/t";

interface SignInButtonProps {
  domain: string;
}

export function SignInButton({ domain }: SignInButtonProps) {
  async function handleSignIn() {
    await authClient.signIn.sso({
      domain,
      callbackURL: "/",
    });
  }

  return (
    <Button onClick={handleSignIn} className="w-full">
      {t("auth.signIn")}
    </Button>
  );
}
