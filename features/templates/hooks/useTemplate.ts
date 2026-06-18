"use client";

import { useQuery } from "@tanstack/react-query";
import type { TemplateRecord } from "@/types/templates";

async function fetchTemplate(id: string): Promise<TemplateRecord> {
  const res = await fetch(`/api/templates/${id}`);
  if (!res.ok) throw new Error("Failed to fetch template");
  return res.json() as Promise<TemplateRecord>;
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: ["templates", id],
    queryFn: () => fetchTemplate(id),
    enabled: !!id,
  });
}
