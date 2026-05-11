import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const documents = sqliteTable("documents", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  version: integer("version").notNull().default(1),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const changes = sqliteTable("changes", {
  id: text("id").primaryKey(),
  document_id: text("document_id")
    .notNull()
    .references(() => documents.id),
  target_text: text("target_text").notNull(),
  occurrence: integer("occurrence").notNull(),
  replacement: text("replacement").notNull(),
  applied_at: text("applied_at").notNull(),
});
