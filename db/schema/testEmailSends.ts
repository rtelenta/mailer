import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { generateId } from "better-auth";
import { user } from "./auth";
import { templates } from "./templates";

export const testEmailSends = pgTable(
  "test_email_sends",
  {
    id: text("id")
      .$defaultFn(() => generateId())
      .primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    templateId: text("template_id")
      .notNull()
      .references(() => templates.id, { onDelete: "cascade" }),
    sentAt: timestamp("sent_at").notNull().defaultNow(),
  },
  (t) => [index("test_email_sends_user_sent_idx").on(t.userId, t.sentAt)]
);
