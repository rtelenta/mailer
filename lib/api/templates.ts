import { Hono } from "hono";
import { z } from "zod";
import { generateId } from "better-auth";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { templates } from "@/db/schema/templates";
import { templateShares } from "@/db/schema/templateShares";
import { testEmailSends } from "@/db/schema/testEmailSends";
import { eq, and, desc, sql, count, gte } from "drizzle-orm";
import { templateSharesRouter } from "@/lib/api/templateShares";
import { sendEmail } from "@/lib/email";
import { FROM_ADDRESS } from "@/lib/constants";
import { trackEvent } from "@/lib/usage/events";

const createTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  mjml: z.string().max(500_000).optional(),
  subject: z.string().min(1).max(998),
  fromName: z.string().min(1).max(255),
  replyTo: z.string().email().optional(),
});

export const templatesRouter = new Hono();

async function getAuthenticatedUserId(req: Request): Promise<string | null> {
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user?.id ?? null;
}

templatesRouter.get("/templates", async (c) => {
  const userId = await getAuthenticatedUserId(c.req.raw);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const owned = await db
    .select({
      id: templates.id,
      name: templates.name,
      subject: templates.subject,
      fromName: templates.fromName,
      replyTo: templates.replyTo,
      createdAt: templates.createdAt,
      role: sql<"owner">`'owner'`,
    })
    .from(templates)
    .where(eq(templates.userId, userId));

  const shared = await db
    .select({
      id: templates.id,
      name: templates.name,
      subject: templates.subject,
      fromName: templates.fromName,
      replyTo: templates.replyTo,
      createdAt: templates.createdAt,
      role: sql<"collaborator">`'collaborator'`,
    })
    .from(templates)
    .innerJoin(templateShares, eq(templateShares.templateId, templates.id))
    .where(eq(templateShares.userId, userId));

  const all = [...owned, ...shared].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return c.json({ templates: all });
});

templatesRouter.post("/templates", async (c) => {
  const userId = await getAuthenticatedUserId(c.req.raw);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json().catch(() => null);
  const parsed = createTemplateSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", issues: parsed.error.issues }, 422);
  }

  const { name, subject, fromName, replyTo } = parsed.data;
  const mjml = parsed.data.mjml ?? "";

  const [created] = await db
    .insert(templates)
    .values({
      id: generateId(),
      userId,
      name,
      mjml,
      subject,
      fromName,
      replyTo: replyTo ?? null,
    })
    .returning();

  return c.json(created, 201);
});

const updateTemplateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  mjml: z.string().min(1).max(500_000).optional(),
  subject: z.string().min(1).max(998).optional(),
  fromName: z.string().min(1).max(255).optional(),
  replyTo: z.string().email().nullable().optional(),
});

templatesRouter.get("/templates/:id", async (c) => {
  const userId = await getAuthenticatedUserId(c.req.raw);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");

  const [row] = await db
    .select()
    .from(templates)
    .where(eq(templates.id, id))
    .limit(1);

  if (!row) return c.json({ error: "Not found" }, 404);

  if (row.userId === userId) {
    return c.json({ ...row, role: "owner" });
  }

  const [share] = await db
    .select({ id: templateShares.id })
    .from(templateShares)
    .where(
      and(eq(templateShares.templateId, id), eq(templateShares.userId, userId))
    )
    .limit(1);

  if (!share) return c.json({ error: "Not found" }, 404);

  return c.json({ ...row, role: "collaborator" });
});

templatesRouter.delete("/templates/:id", async (c) => {
  const userId = await getAuthenticatedUserId(c.req.raw);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");

  const [existing] = await db
    .select({ id: templates.id, userId: templates.userId })
    .from(templates)
    .where(eq(templates.id, id))
    .limit(1);

  if (!existing) return c.json({ error: "Not found" }, 404);
  if (existing.userId !== userId) return c.json({ error: "Forbidden" }, 403);

  await db.delete(templates).where(eq(templates.id, id));

  return new Response(null, { status: 204 });
});

templatesRouter.patch("/templates/:id", async (c) => {
  const userId = await getAuthenticatedUserId(c.req.raw);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");

  const [existing] = await db
    .select({ id: templates.id, userId: templates.userId })
    .from(templates)
    .where(eq(templates.id, id))
    .limit(1);

  if (!existing) return c.json({ error: "Not found" }, 404);

  if (existing.userId !== userId) {
    const [share] = await db
      .select({ id: templateShares.id })
      .from(templateShares)
      .where(
        and(
          eq(templateShares.templateId, id),
          eq(templateShares.userId, userId)
        )
      )
      .limit(1);
    if (!share) return c.json({ error: "Forbidden" }, 403);
  }

  const body = await c.req.json().catch(() => null);
  const parsed = updateTemplateSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", issues: parsed.error.issues }, 422);
  }

  const updates: Record<string, unknown> = { ...parsed.data, updatedAt: sql`now()` };

  const [updated] = await db
    .update(templates)
    .set(updates)
    .where(eq(templates.id, id))
    .returning();

  return c.json(updated);
});

const TEST_SEND_DAILY_LIMIT = 100;

const testSendSchema = z.object({
  sampleData: z.record(z.string(), z.unknown()).optional(),
});

templatesRouter.post("/templates/:id/test-send", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);
  const userId = session.user.id;
  const userEmail = session.user.email;

  const id = c.req.param("id");

  const [row] = await db
    .select()
    .from(templates)
    .where(eq(templates.id, id))
    .limit(1);

  if (!row) return c.json({ error: "Not found" }, 404);

  if (row.userId !== userId) {
    const [share] = await db
      .select({ id: templateShares.id })
      .from(templateShares)
      .where(
        and(eq(templateShares.templateId, id), eq(templateShares.userId, userId))
      )
      .limit(1);
    if (!share) return c.json({ error: "Forbidden" }, 403);
  }

  const windowStart = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [{ total }] = await db
    .select({ total: count() })
    .from(testEmailSends)
    .where(and(eq(testEmailSends.userId, userId), gte(testEmailSends.sentAt, windowStart)));

  if (total >= TEST_SEND_DAILY_LIMIT) {
    const [oldest] = await db
      .select({ sentAt: testEmailSends.sentAt })
      .from(testEmailSends)
      .where(and(eq(testEmailSends.userId, userId), gte(testEmailSends.sentAt, windowStart)))
      .orderBy(testEmailSends.sentAt)
      .limit(1);
    const resetAt = oldest
      ? new Date(oldest.sentAt.getTime() + 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    return c.json({ error: "rate_limit_exceeded", limit: TEST_SEND_DAILY_LIMIT, resetAt }, 429);
  }

  const body = await c.req.json().catch(() => ({}));
  const parsed = testSendSchema.safeParse(body);
  const sampleData = parsed.success ? (parsed.data.sampleData ?? {}) : {};

  const result = await sendEmail({
    to: userEmail,
    mjml: row.mjml,
    content: sampleData,
    defaults: {
      subject: row.subject,
      fromName: row.fromName,
      fromAddress: FROM_ADDRESS ?? "",
      replyTo: row.replyTo ?? undefined,
    },
  });

  await db.insert(testEmailSends).values({
    userId,
    templateId: id,
  });

  if (!result.ok) {
    await trackEvent({ userId, templateId: id, eventType: "test_send_error", metadata: { code: result.code, message: result.message } });
    return c.json({ ok: false, code: result.code, message: result.message }, 502);
  }

  await trackEvent({ userId, templateId: id, eventType: "test_send_ok", metadata: { messageId: result.messageId } });
  return c.json({ ok: true, messageId: result.messageId });
});

templatesRouter.route("/templates", templateSharesRouter);
