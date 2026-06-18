"use client";

import { useQuery } from "@tanstack/react-query";
import type { auth } from "@/lib/auth";

type SessionData = typeof auth.$Infer.Session;

async function fetchSession(): Promise<SessionData | null> {
  const res = await fetch("/api/auth/get-session");
  if (!res.ok) return null;
  return res.json() as Promise<SessionData | null>;
}

export function useSession() {
  const { data, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: fetchSession,
    staleTime: 1000 * 60 * 5,
  });

  return {
    user: data?.user ?? null,
    isLoading,
  };
}
