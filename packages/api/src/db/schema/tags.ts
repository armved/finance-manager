import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 50 }).notNull(),
  color: varchar("color", { length: 7 }), // hex #RRGGBB
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
