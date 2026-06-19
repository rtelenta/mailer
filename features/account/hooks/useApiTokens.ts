"use client";
import { useQuery } from "@tanstack/react-query";

export interface ApiTokenRecord {
  id: string;
  name: string;
  tokenPrefix: string;
  lastUsedAt: string | null;
  createdAt: string;
}

async function fetchTokens(): Promise<ApiTokenRecord[]> {
  const res = await fetch("/api/tokens");
  if (!res.ok) throw new Error("Failed to fetch tokens");
  const json = await res.json() as { tokens: ApiTokenRecord[] };
  return json.tokens;
}

export function useApiTokens() {
  return useQuery({ queryKey: ["api-tokens"], queryFn: fetchTokens });
}
