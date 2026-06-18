import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const templates = pgTable("templates", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  mjml: text("mjml").notNull(),
  subject: text("subject").notNull(),
  fromName: text("from_name").notNull(),
  replyTo: text("reply_to"),
  preheader: text("preheader"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
