"use client";

import { useQuery } from "@tanstack/react-query";
import type { TemplateListItem } from "@/types/templates";

async function fetchTemplates(): Promise<TemplateListItem[]> {
  const res = await fetch("/api/templates");
  if (!res.ok) throw new Error("Failed to fetch templates");
  const data = (await res.json()) as { templates: TemplateListItem[] };
  return data.templates;
}

export function useTemplates() {
  return useQuery({
    queryKey: ["templates"],
    queryFn: fetchTemplates,
  });
}
