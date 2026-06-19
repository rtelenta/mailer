import { Hono } from "hono";
import { auth } from "@/lib/auth";
import { templatesRouter } from "@/lib/api/templates";
import { tokensRouter } from "@/lib/api/tokens";
import { v1Router } from "@/lib/api/v1";

export const app = new Hono().basePath("/api");

app.get("/health", (c) => c.json({ ok: true }));

app.on(["GET", "POST"], "/auth/*", (c) => auth.handler(c.req.raw));

app.route("/", templatesRouter);
app.route("/", tokensRouter);
app.route("/v1", v1Router);
