"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateTemplateInput, TemplateRecord } from "@/types/templates";

export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTemplateInput): Promise<TemplateRecord> => {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? "Failed to create template");
      }
      return res.json() as Promise<TemplateRecord>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}
