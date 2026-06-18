"use client";

import { useQuery } from "@tanstack/react-query";
import type { TemplateCollaborator } from "@/types/templates";

async function fetchTemplateShares(id: string): Promise<TemplateCollaborator[]> {
  const res = await fetch(`/api/templates/${id}/shares`);
  if (!res.ok) throw new Error("Failed to fetch shares");
  const data = (await res.json()) as { shares: TemplateCollaborator[] };
  return data.shares;
}

export function useTemplateShares(id: string) {
  return useQuery({
    queryKey: ["templates", id, "shares"],
    queryFn: () => fetchTemplateShares(id),
    enabled: !!id,
  });
}
