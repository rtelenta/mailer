"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { t } from "@/utils/t";

const navItems = [
  { href: "/dashboard", label: t("shell.nav.dashboard") },
  { href: "/templates", label: t("shell.nav.templates") },
  { href: "/settings", label: t("shell.nav.settings") },
] as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            buttonVariants({ variant: "ghost", size: "default" }),
            "justify-start",
            pathname.startsWith(href) && "bg-muted text-foreground"
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
