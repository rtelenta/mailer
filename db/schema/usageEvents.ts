import { pgTable, text, timestamp, index, jsonb } from "drizzle-orm/pg-core";
import { generateId } from "better-auth";
import { user } from "./auth";
import { templates } from "./templates";

export const usageEvents = pgTable(
  "usage_events",
  {
    id: text("id")
      .$defaultFn(() => generateId())
      .primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    templateId: text("template_id").references(() => templates.id, {
      onDelete: "set null",
    }),
    eventType: text("event_type").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("usage_events_user_created_idx").on(t.userId, t.createdAt),
    index("usage_events_user_type_created_idx").on(
      t.userId,
      t.eventType,
      t.createdAt
    ),
    index("usage_events_template_created_idx").on(t.templateId, t.createdAt),
  ]
);
