"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TemplateCollaborator, AddShareInput } from "@/types/templates";

export function useAddShare(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AddShareInput): Promise<TemplateCollaborator> => {
      const res = await fetch(`/api/templates/${id}/shares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json()) as TemplateCollaborator & { error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? "Failed to add collaborator");
      }
      return json;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["templates", id, "shares"] });
    },
  });
}
