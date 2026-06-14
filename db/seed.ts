import { db } from "@/db";
import { ssoProvider } from "@/db/schema/auth";
import {
  SSO_BASE_URL,
  SSO_CLIENT_ID,
  SSO_CLIENT_SECRET,
} from "@/lib/constants";
import { generateId } from "better-auth";

if (!SSO_BASE_URL || !SSO_CLIENT_ID || !SSO_CLIENT_SECRET) {
  throw new Error(
    "Missing required env vars: SSO_BASE_URL, SSO_CLIENT_ID, SSO_CLIENT_SECRET",
  );
}

const domain = new URL(SSO_BASE_URL).hostname;
const issuer = `${SSO_BASE_URL}/api/auth`;

const oidcConfig = JSON.stringify({
  issuer,
  clientId: SSO_CLIENT_ID,
  clientSecret: SSO_CLIENT_SECRET,
  discoveryEndpoint: `${SSO_BASE_URL}/api/auth/.well-known/openid-configuration`,
  authorizationEndpoint: `${SSO_BASE_URL}/api/auth/oauth2/authorize`,
  tokenEndpoint: `${SSO_BASE_URL}/api/auth/oauth2/token`,
  scopes: ["openid", "email", "profile"],
});

await db
  .insert(ssoProvider)
  .values({
    id: generateId(),
    providerId: "internal",
    domain,
    issuer,
    oidcConfig,
  })
  .onConflictDoUpdate({
    target: ssoProvider.providerId,
    set: { domain, issuer, oidcConfig },
  });

console.log("SSO provider seeded.");
process.exit(0);
