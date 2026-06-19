import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { t } from "@/utils/t";
import type { DashboardStats } from "@/lib/db/dashboard";

interface StatCardsProps {
  stats: DashboardStats | undefined;
  isLoading: boolean;
}

export function StatCards({ stats, isLoading }: StatCardsProps) {
  const items = [
    {
      label: t("dashboard.stats.templateCount"),
      value: stats?.templateCount,
    },
    {
      label: t("dashboard.stats.totalSends"),
      value: stats?.totalSends,
    },
    {
      label: t("dashboard.stats.totalApiCalls"),
      value: stats?.totalApiCalls,
    },
    {
      label: t("dashboard.stats.errorRate"),
      value:
        stats !== undefined
          ? `${(stats.errorRate * 100).toFixed(1)}%`
          : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || item.value === undefined ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-2xl font-bold">{item.value}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
