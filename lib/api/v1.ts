import { Hono } from "hono";
import { z } from "zod";
import { db } from "@/db";
import { templates } from "@/db/schema/templates";
import { eq, and } from "drizzle-orm";
import { getRequestUserId } from "@/lib/api/auth";
import { sendEmail } from "@/lib/email";
import { FROM_ADDRESS } from "@/lib/constants";
import { trackEvent } from "@/lib/usage/events";

const sendSchema = z.object({
  templateName: z.string().min(1),
  to: z.string().email().or(z.array(z.string().email()).min(1)),
  content: z.record(z.string(), z.unknown()).optional().default({}),
  subject: z.string().min(1).optional(),
  fromName: z.string().min(1).optional(),
  replyTo: z.string().email().optional(),
  preheader: z.string().optional(),
});

export const v1Router = new Hono();

v1Router.post("/send", async (c) => {
  const userId = await getRequestUserId(c.req.raw);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json().catch(() => null);
  const parsed = sendSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", issues: parsed.error.issues }, 422);
  }

  const { templateName, to, content, subject, fromName, replyTo, preheader } = parsed.data;

  const [template] = await db
    .select()
    .from(templates)
    .where(and(eq(templates.userId, userId), eq(templates.name, templateName)))
    .limit(1);

  if (!template) return c.json({ error: "Template not found" }, 404);

  const overrides: Record<string, string> = {};
  if (subject !== undefined) overrides.subject = subject;
  if (fromName !== undefined) overrides.fromName = fromName;
  if (replyTo !== undefined) overrides.replyTo = replyTo;
  if (preheader !== undefined) overrides.preheader = preheader;

  const result = await sendEmail({
    to: Array.isArray(to) ? to : [to],
    mjml: template.mjml,
    content,
    defaults: {
      subject: template.subject,
      fromName: template.fromName,
      fromAddress: FROM_ADDRESS ?? "",
      replyTo: template.replyTo ?? undefined,
      preheader: template.preheader ?? undefined,
    },
    overrides: Object.keys(overrides).length > 0 ? overrides : undefined,
  });

  if (!result.ok) {
    await trackEvent({ userId, templateId: template.id, eventType: "api_send_error", metadata: { code: result.code, message: result.message } });
    return c.json({ ok: false, code: result.code, message: result.message }, 400);
  }

  await trackEvent({ userId, templateId: template.id, eventType: "api_send_ok", metadata: { messageId: result.messageId } });
  return c.json({ ok: true, messageId: result.messageId });
});
