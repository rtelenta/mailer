"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useRemoveShare(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (shareUserId: string): Promise<void> => {
      const res = await fetch(`/api/templates/${id}/shares/${shareUserId}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? "Failed to remove collaborator");
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["templates", id, "shares"] });
    },
  });
}
