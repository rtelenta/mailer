import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { generateId } from "better-auth";
import { user } from "./auth";

export const apiTokens = pgTable(
  "api_tokens",
  {
    id: text("id")
      .$defaultFn(() => generateId())
      .primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    tokenHash: text("token_hash").notNull().unique(),
    tokenPrefix: text("token_prefix").notNull(),
    lastUsedAt: timestamp("last_used_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("api_tokens_user_id_idx").on(t.userId)]
);
