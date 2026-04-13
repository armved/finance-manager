import { pgTable, varchar, integer } from "drizzle-orm/pg-core";

export const currencies = pgTable("currencies", {
  code: varchar("code", { length: 3 }).primaryKey(), // e.g. USD, EUR
  name: varchar("name", { length: 50 }).notNull(),
  symbol: varchar("symbol", { length: 5 }).notNull(),
  decimalPlaces: integer("decimal_places").notNull().default(2),
});
