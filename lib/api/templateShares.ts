import { Hono } from "hono";
import { z } from "zod";
import { generateId } from "better-auth";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { templates } from "@/db/schema/templates";
import { templateShares } from "@/db/schema/templateShares";
import { user } from "@/db/schema/auth";
import { eq, and } from "drizzle-orm";

export const templateSharesRouter = new Hono();

async function getAuthenticatedUserId(req: Request): Promise<string | null> {
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user?.id ?? null;
}

const addShareSchema = z.object({
  email: z.string().email(),
});

templateSharesRouter.get("/:id/shares", async (c) => {
  const userId = await getAuthenticatedUserId(c.req.raw);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");

  const [template] = await db
    .select({ id: templates.id, userId: templates.userId })
    .from(templates)
    .where(eq(templates.id, id))
    .limit(1);

  if (!template) return c.json({ error: "Not found" }, 404);
  if (template.userId !== userId) return c.json({ error: "Forbidden" }, 403);

  const shares = await db
    .select({
      userId: user.id,
      email: user.email,
      name: user.name,
    })
    .from(templateShares)
    .innerJoin(user, eq(templateShares.userId, user.id))
    .where(eq(templateShares.templateId, id));

  return c.json({ shares });
});

templateSharesRouter.post("/:id/shares", async (c) => {
  const userId = await getAuthenticatedUserId(c.req.raw);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");

  const [template] = await db
    .select({ id: templates.id, userId: templates.userId })
    .from(templates)
    .where(eq(templates.id, id))
    .limit(1);

  if (!template) return c.json({ error: "Not found" }, 404);
  if (template.userId !== userId) return c.json({ error: "Forbidden" }, 403);

  const body = await c.req.json().catch(() => null);
  const parsed = addShareSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", issues: parsed.error.issues }, 422);
  }

  const { email } = parsed.data;

  const [targetUser] = await db
    .select({ id: user.id, email: user.email, name: user.name })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (!targetUser) {
    return c.json({ error: "No user with that email address" }, 422);
  }

  if (targetUser.id === userId) {
    return c.json({ error: "Cannot share with yourself" }, 422);
  }

  const [existing] = await db
    .select({ id: templateShares.id })
    .from(templateShares)
    .where(
      and(
        eq(templateShares.templateId, id),
        eq(templateShares.userId, targetUser.id)
      )
    )
    .limit(1);

  if (existing) {
    return c.json({ error: "Already shared with this user" }, 409);
  }

  await db.insert(templateShares).values({
    id: generateId(),
    templateId: id,
    userId: targetUser.id,
  });

  return c.json(
    { userId: targetUser.id, email: targetUser.email, name: targetUser.name },
    201
  );
});

templateSharesRouter.delete("/:id/shares/:shareUserId", async (c) => {
  const userId = await getAuthenticatedUserId(c.req.raw);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");
  const shareUserId = c.req.param("shareUserId");

  const [template] = await db
    .select({ id: templates.id, userId: templates.userId })
    .from(templates)
    .where(eq(templates.id, id))
    .limit(1);

  if (!template) return c.json({ error: "Not found" }, 404);
  if (template.userId !== userId) return c.json({ error: "Forbidden" }, 403);

  const [existing] = await db
    .select({ id: templateShares.id })
    .from(templateShares)
    .where(
      and(
        eq(templateShares.templateId, id),
        eq(templateShares.userId, shareUserId)
      )
    )
    .limit(1);

  if (!existing) return c.json({ error: "Not found" }, 404);

  await db
    .delete(templateShares)
    .where(
      and(
        eq(templateShares.templateId, id),
        eq(templateShares.userId, shareUserId)
      )
    );

  return new Response(null, { status: 204 });
});
