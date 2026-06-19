"use client";

import { t } from "@/utils/t";
import { useDashboardStats } from "@/features/dashboard/hooks/useDashboardStats";
import { StatCards } from "@/features/dashboard/components/StatCards";
import { SendsOverTimeChart } from "@/features/dashboard/components/SendsOverTimeChart";
import { SendsPerTemplateTable } from "@/features/dashboard/components/SendsPerTemplateTable";
import { ApiVsTestBreakdown } from "@/features/dashboard/components/ApiVsTestBreakdown";

export function DashboardPage() {
  const { data, isLoading } = useDashboardStats();

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">{t("dashboard.title")}</h1>
      <StatCards stats={data} isLoading={isLoading} />
      <SendsOverTimeChart data={data?.sendsOverTime} isLoading={isLoading} />
      <div className="grid gap-4 lg:grid-cols-2">
        <SendsPerTemplateTable data={data?.sendsByTemplate} isLoading={isLoading} />
        <ApiVsTestBreakdown stats={data} isLoading={isLoading} />
      </div>
    </div>
  );
}
