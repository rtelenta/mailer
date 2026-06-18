import { Hono } from "hono";
import { z } from "zod";
import { generateId } from "better-auth";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { templates } from "@/db/schema/templates";
import { eq, and, desc } from "drizzle-orm";

const createTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  mjml: z.string().min(1).max(500_000),
  subject: z.string().min(1).max(998),
  fromName: z.string().min(1).max(255),
  replyTo: z.string().email().optional(),
  preheader: z.string().max(255).optional(),
});

export const templatesRouter = new Hono();

async function getAuthenticatedUserId(req: Request): Promise<string | null> {
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user?.id ?? null;
}

templatesRouter.get("/templates", async (c) => {
  const userId = await getAuthenticatedUserId(c.req.raw);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const rows = await db
    .select()
    .from(templates)
    .where(eq(templates.userId, userId))
    .orderBy(desc(templates.createdAt));

  return c.json({ templates: rows });
});

templatesRouter.post("/templates", async (c) => {
  const userId = await getAuthenticatedUserId(c.req.raw);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json().catch(() => null);
  const parsed = createTemplateSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", issues: parsed.error.issues }, 422);
  }

  const { name, mjml, subject, fromName, replyTo, preheader } = parsed.data;

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
      preheader: preheader ?? null,
    })
    .returning();

  return c.json(created, 201);
});

templatesRouter.delete("/templates/:id", async (c) => {
  const userId = await getAuthenticatedUserId(c.req.raw);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");

  const existing = await db
    .select({ id: templates.id })
    .from(templates)
    .where(and(eq(templates.id, id), eq(templates.userId, userId)))
    .limit(1);

  if (existing.length === 0) {
    return c.json({ error: "Not found" }, 404);
  }

  await db
    .delete(templates)
    .where(and(eq(templates.id, id), eq(templates.userId, userId)));

  return new Response(null, { status: 204 });
});
