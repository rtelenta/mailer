"use client";

import { useQuery } from "@tanstack/react-query";
import type { DashboardStats } from "@/features/dashboard/db";

async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch("/api/dashboard/stats");
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  return res.json() as Promise<DashboardStats>;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: fetchDashboardStats,
    staleTime: 60_000,
  });
}
