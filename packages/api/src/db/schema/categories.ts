import { pgTable, uuid, varchar, integer, boolean, timestamp, type AnyPgColumn } from "drizzle-orm/pg-core";
import { categoryTypeEnum } from "./enums";

// Self-referencing via parent_id for infinite hierarchy.
// Queried with PostgreSQL recursive CTEs.
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  parentId: uuid("parent_id").references((): AnyPgColumn => categories.id),
  type: categoryTypeEnum("type").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 7 }), // hex #RRGGBB
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
