import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { generateId } from "better-auth";
import { user } from "./auth";
import { templates } from "./templates";

export const templateShares = pgTable(
  "template_shares",
  {
    id: text("id")
      .$defaultFn(() => generateId())
      .primaryKey(),
    templateId: text("template_id")
      .notNull()
      .references(() => templates.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("template_shares_template_user_idx").on(t.templateId, t.userId),
  ]
);
