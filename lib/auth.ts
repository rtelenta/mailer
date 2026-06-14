import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { sso } from "@better-auth/sso";
import { db } from "@/db";
import * as schema from "@/db/schema/auth";
import {
  SSO_BASE_URL,
  BETTER_AUTH_SECRET,
  NEXT_PUBLIC_APP_URL,
} from "@/lib/constants";

if (!BETTER_AUTH_SECRET) {
  throw new Error("Missing required auth env var: BETTER_AUTH_SECRET");
}

export const auth = betterAuth({
  secret: BETTER_AUTH_SECRET,
  baseURL: NEXT_PUBLIC_APP_URL,
  trustedOrigins: [SSO_BASE_URL!],
  database: drizzleAdapter(db, { provider: "pg", schema }),
  plugins: [
    sso(),
  ],
});
