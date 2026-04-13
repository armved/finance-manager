import { pgTable, uuid, decimal, timestamp } from "drizzle-orm/pg-core";
import { transactions } from "./transactions";

// A transfer = expense on source account + income on destination account,
// linked here. Keeps aggregation queries clean — no "transfer" type needed.
export const transfers = pgTable("transfers", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceTransactionId: uuid("source_transaction_id")
    .notNull()
    .references(() => transactions.id),
  destinationTransactionId: uuid("destination_transaction_id")
    .notNull()
    .references(() => transactions.id),
  exchangeRate: decimal("exchange_rate", { precision: 12, scale: 6 })
    .notNull()
    .default("1"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
