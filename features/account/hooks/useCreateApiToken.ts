"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiTokenRecord } from "./useApiTokens";

interface CreateTokenResult extends ApiTokenRecord {
  plaintext: string;
}

export function useCreateApiToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string): Promise<CreateTokenResult> => {
      const res = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const json = await res.json() as { token: CreateTokenResult };
      if (!res.ok) throw new Error((json as unknown as { error: string }).error ?? "Failed to create token");
      return json.token;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-tokens"] });
    },
  });
}
