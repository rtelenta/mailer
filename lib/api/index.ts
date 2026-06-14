import { Hono } from "hono";
import { auth } from "@/lib/auth";

export const app = new Hono().basePath("/api");

app.get("/health", (c) => c.json({ ok: true }));

app.get("/auth/callback/sso", (c) => {
  const url = new URL(c.req.url);
  url.pathname = "/api/auth/sso/callback/internal";
  return auth.handler(new Request(url.toString(), c.req.raw));
});

app.on(["GET", "POST"], "/auth/*", (c) => auth.handler(c.req.raw));
