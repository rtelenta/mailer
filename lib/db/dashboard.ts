import { db } from "@/db";
import { usageEvents } from "@/db/schema/usageEvents";
import { templates } from "@/db/schema/templates";
import { eq, and, gte, isNotNull, sql, count } from "drizzle-orm";

export interface DashboardStats {
  templateCount: number;
  totalSends: number;
  totalApiCalls: number;
  errorRate: number;
  sendsOverTime: Array<{ date: string; sends: number; errors: number }>;
  sendsByTemplate: Array<{
    templateId: string;
    templateName: string;
    sends: number;
    errors: number;
  }>;
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [templateCountResult, eventTotals, timeSeriesRows, templateRows] = await Promise.all([
    db
      .select({ count: count() })
      .from(templates)
      .where(eq(templates.userId, userId)),

    db
      .select({
        eventType: usageEvents.eventType,
        count: count(),
      })
      .from(usageEvents)
      .where(eq(usageEvents.userId, userId))
      .groupBy(usageEvents.eventType),

    db
      .select({
        date: sql<string>`to_char(date_trunc('day', ${usageEvents.createdAt}), 'YYYY-MM-DD')`,
        sends: sql<number>`cast(count(*) filter (where ${usageEvents.eventType} in ('test_send_ok', 'api_send_ok')) as int)`,
        errors: sql<number>`cast(count(*) filter (where ${usageEvents.eventType} in ('test_send_error', 'api_send_error')) as int)`,
      })
      .from(usageEvents)
      .where(and(eq(usageEvents.userId, userId), gte(usageEvents.createdAt, thirtyDaysAgo)))
      .groupBy(sql`date_trunc('day', ${usageEvents.createdAt})`)
      .orderBy(sql`date_trunc('day', ${usageEvents.createdAt})`),

    db
      .select({
        templateId: usageEvents.templateId,
        templateName: templates.name,
        sends: sql<number>`cast(count(*) filter (where ${usageEvents.eventType} in ('test_send_ok', 'api_send_ok')) as int)`,
        errors: sql<number>`cast(count(*) filter (where ${usageEvents.eventType} in ('test_send_error', 'api_send_error')) as int)`,
      })
      .from(usageEvents)
      .innerJoin(templates, eq(usageEvents.templateId, templates.id))
      .where(and(eq(usageEvents.userId, userId), isNotNull(usageEvents.templateId)))
      .groupBy(usageEvents.templateId, templates.name)
      .orderBy(sql`count(*) desc`),
  ]);

  const countByType = new Map(eventTotals.map((r) => [r.eventType, r.count]));
  const totalSends =
    (countByType.get("test_send_ok") ?? 0) +
    (countByType.get("api_send_ok") ?? 0) +
    (countByType.get("test_send_error") ?? 0) +
    (countByType.get("api_send_error") ?? 0);
  const totalApiCalls =
    (countByType.get("api_send_ok") ?? 0) + (countByType.get("api_send_error") ?? 0);
  const totalErrors =
    (countByType.get("test_send_error") ?? 0) + (countByType.get("api_send_error") ?? 0);
  const errorRate = totalSends > 0 ? totalErrors / totalSends : 0;

  return {
    templateCount: templateCountResult[0]?.count ?? 0,
    totalSends,
    totalApiCalls,
    errorRate,
    sendsOverTime: timeSeriesRows.map((r) => ({
      date: r.date,
      sends: r.sends,
      errors: r.errors,
    })),
    sendsByTemplate: templateRows
      .filter((r): r is typeof r & { templateId: string } => r.templateId !== null)
      .map((r) => ({
        templateId: r.templateId,
        templateName: r.templateName,
        sends: r.sends,
        errors: r.errors,
      })),
  };
}
