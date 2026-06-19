import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { t } from "@/utils/t";
import type { DashboardStats } from "@/lib/db/dashboard";

interface ApiVsTestBreakdownProps {
  stats: DashboardStats | undefined;
  isLoading: boolean;
}

export function ApiVsTestBreakdown({ stats, isLoading }: ApiVsTestBreakdownProps) {
  const apiCalls = stats?.totalApiCalls ?? 0;
  const testSends = stats !== undefined ? stats.totalSends - stats.totalApiCalls : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.breakdown.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          <div className="flex gap-8">
            <div>
              <p className="text-sm text-muted-foreground">{t("dashboard.breakdown.apiSends")}</p>
              <p className="text-2xl font-bold">{apiCalls}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("dashboard.breakdown.testSends")}</p>
              <p className="text-2xl font-bold">{testSends}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
