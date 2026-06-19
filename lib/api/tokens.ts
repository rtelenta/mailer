import { Hono } from "hono";
import { z } from "zod";
import crypto from "crypto";
import { db } from "@/db";
import { apiTokens } from "@/db/schema/apiTokens";
import { eq, and } from "drizzle-orm";
import { getRequestUserId } from "@/lib/api/auth";

const createTokenSchema = z.object({
  name: z.string().min(1).max(255),
});

export const tokensRouter = new Hono();

tokensRouter.get("/tokens", async (c) => {
  const userId = await getRequestUserId(c.req.raw);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const rows = await db
    .select({
      id: apiTokens.id,
      name: apiTokens.name,
      tokenPrefix: apiTokens.tokenPrefix,
      lastUsedAt: apiTokens.lastUsedAt,
      createdAt: apiTokens.createdAt,
    })
    .from(apiTokens)
    .where(eq(apiTokens.userId, userId))
    .orderBy(apiTokens.createdAt);

  return c.json({ tokens: rows });
});

tokensRouter.post("/tokens", async (c) => {
  const userId = await getRequestUserId(c.req.raw);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json().catch(() => null);
  const parsed = createTokenSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", issues: parsed.error.issues }, 422);
  }

  const plaintext = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(plaintext).digest("hex");
  const tokenPrefix = plaintext.slice(0, 8);

  const [created] = await db
    .insert(apiTokens)
    .values({ userId, name: parsed.data.name, tokenHash, tokenPrefix })
    .returning({
      id: apiTokens.id,
      name: apiTokens.name,
      tokenPrefix: apiTokens.tokenPrefix,
      lastUsedAt: apiTokens.lastUsedAt,
      createdAt: apiTokens.createdAt,
    });

  return c.json({ token: { ...created, plaintext } }, 201);
});

tokensRouter.delete("/tokens/:id", async (c) => {
  const userId = await getRequestUserId(c.req.raw);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");

  const deleted = await db
    .delete(apiTokens)
    .where(and(eq(apiTokens.id, id), eq(apiTokens.userId, userId)))
    .returning({ id: apiTokens.id });

  if (deleted.length === 0) return c.json({ error: "Not found" }, 404);

  return new Response(null, { status: 204 });
});
