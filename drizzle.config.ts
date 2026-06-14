import { defineConfig } from "drizzle-kit";
import { DATABASE_URL } from "./lib/constants";

export default defineConfig({
  schema: "./db/schema",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL!,
  },
});
