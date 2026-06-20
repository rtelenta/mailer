import { Hono } from "hono";
import { auth } from "@/lib/auth";
import { templatesRouter } from "@/features/templates/api";
import { tokensRouter } from "@/features/account/api";
import { v1Router } from "@/features/send/api";
import { dashboardRouter } from "@/features/dashboard/api";

export const app = new Hono().basePath("/api");

app.get("/health", (c) => c.json({ ok: true }));

app.on(["GET", "POST"], "/auth/*", (c) => auth.handler(c.req.raw));

app.route("/", templatesRouter);
app.route("/", tokensRouter);
app.route("/v1", v1Router);
app.route("/", dashboardRouter);
