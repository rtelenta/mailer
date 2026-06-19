"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { t } from "@/utils/t";
import type { DashboardStats } from "@/lib/db/dashboard";

const chartConfig: ChartConfig = {
  sends: {
    label: t("dashboard.chart.sends"),
    color: "hsl(var(--chart-1))",
  },
  errors: {
    label: t("dashboard.chart.errors"),
    color: "hsl(var(--chart-2))",
  },
};

interface SendsOverTimeChartProps {
  data: DashboardStats["sendsOverTime"] | undefined;
  isLoading: boolean;
}

export function SendsOverTimeChart({ data, isLoading }: SendsOverTimeChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.chart.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <ChartContainer config={chartConfig}>
            <AreaChart data={data ?? []} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="sends"
                stackId="1"
                stroke="var(--color-sends)"
                fill="var(--color-sends)"
                fillOpacity={0.2}
              />
              <Area
                type="monotone"
                dataKey="errors"
                stackId="2"
                stroke="var(--color-errors)"
                fill="var(--color-errors)"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
