import { Hono } from "hono";
import { getDashboardStats } from "@/features/dashboard/db";
import { getRequestUserId } from "@/lib/api/auth";

export const dashboardRouter = new Hono();

dashboardRouter.get("/dashboard/stats", async (c) => {
  const userId = await getRequestUserId(c.req.raw);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const stats = await getDashboardStats(userId);
  return c.json(stats);
});
