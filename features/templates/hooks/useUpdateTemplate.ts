"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateTemplateInput, TemplateRecord } from "@/types/templates";

export function useUpdateTemplate(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateTemplateInput): Promise<TemplateRecord> => {
      const res = await fetch(`/api/templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? "Failed to update template");
      }
      return res.json() as Promise<TemplateRecord>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      queryClient.invalidateQueries({ queryKey: ["templates", id] });
    },
  });
}
