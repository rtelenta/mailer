"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useRevokeApiToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const res = await fetch(`/api/tokens/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("Failed to revoke token");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-tokens"] });
    },
  });
}
