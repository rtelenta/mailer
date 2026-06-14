## 1. SSO Auth Client

- [x] 1.1 In `/home/renzo/projects/sso/lib/auth-client.ts`, import `oauthProviderClient` from `@better-auth/oauth-provider/client` and add it to the `plugins` array in `createAuthClient`

## 2. SSO Sign-In Page

- [x] 2.1 In `/home/renzo/projects/sso/app/(auth)/sign-in/page.tsx`, remove the `if (typeof redirectUri === "string" && redirectUri) { redirect(...) }` block so the page always renders `<SignInPage />` regardless of query params
