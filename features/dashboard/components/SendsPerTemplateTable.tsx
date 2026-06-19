import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { t } from "@/utils/t";
import type { DashboardStats } from "@/lib/db/dashboard";

interface SendsPerTemplateTableProps {
  data: DashboardStats["sendsByTemplate"] | undefined;
  isLoading: boolean;
}

export function SendsPerTemplateTable({ data, isLoading }: SendsPerTemplateTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.table.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : !data || data.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t("dashboard.table.emptyState")}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("dashboard.table.columns.templateName")}</TableHead>
                <TableHead className="text-right">{t("dashboard.table.columns.sends")}</TableHead>
                <TableHead className="text-right">{t("dashboard.table.columns.errors")}</TableHead>
                <TableHead className="text-right">{t("dashboard.table.columns.errorRate")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => {
                const rate = row.sends + row.errors > 0
                  ? (row.errors / (row.sends + row.errors)) * 100
                  : 0;
                return (
                  <TableRow key={row.templateId}>
                    <TableCell className="font-medium">{row.templateName}</TableCell>
                    <TableCell className="text-right">{row.sends}</TableCell>
                    <TableCell className="text-right">{row.errors}</TableCell>
                    <TableCell className="text-right">{rate.toFixed(1)}%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
