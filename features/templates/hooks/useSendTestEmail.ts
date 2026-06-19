"use client";

import { useMutation } from "@tanstack/react-query";

export function useSendTestEmail(templateId: string) {
  return useMutation({
    mutationFn: async (sampleData: Record<string, unknown>) => {
      const res = await fetch(`/api/templates/${templateId}/test-send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sampleData }),
      });
      const json = await res.json();
      if (res.status === 429) throw Object.assign(new Error("rate_limit_exceeded"), { status: 429 });
      if (!res.ok) throw new Error(json.message ?? json.error ?? "Unknown error");
      return json as { ok: true; messageId: string };
    },
  });
}
