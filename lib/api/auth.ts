import crypto from "crypto";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { apiTokens } from "@/db/schema/apiTokens";
import { eq } from "drizzle-orm";

export async function getRequestUserId(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const raw = authHeader.slice(7);
    const hash = crypto.createHash("sha256").update(raw).digest("hex");
    const [row] = await db
      .select({ id: apiTokens.id, userId: apiTokens.userId })
      .from(apiTokens)
      .where(eq(apiTokens.tokenHash, hash))
      .limit(1);
    if (!row) return null;
    // fire-and-forget lastUsedAt update
    db.update(apiTokens)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiTokens.id, row.id))
      .execute();
    return row.userId;
  }
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user?.id ?? null;
}
