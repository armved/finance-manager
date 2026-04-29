import { relations } from "drizzle-orm";
import { pgTable, uuid, decimal, date, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { transactionTypeEnum } from "./enums";
import { accounts } from "./accounts";
import { categories } from "./categories";
import { merchants } from "./merchants";
import { tags } from "./tags";

// amount is always positive; direction is encoded in `type`.
// transaction_date is a DATE — no timezone handling needed.
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: transactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  transactionDate: date("transaction_date").notNull(),
  accountId: uuid("account_id").notNull().references(() => accounts.id),
  categoryId: uuid("category_id").references(() => categories.id),
  merchantId: uuid("merchant_id").references(() => merchants.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

// Many-to-many: one transaction → many tags, one tag → many transactions.
export const transactionTags = pgTable(
  "transaction_tags",
  {
    transactionId: uuid("transaction_id")
      .notNull()
      .references(() => transactions.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.transactionId, table.tagId] })],
);

// Relations — unlock `db.query.transactions.findMany({ with: { ... } })`.
export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
  merchant: one(merchants, {
    fields: [transactions.merchantId],
    references: [merchants.id],
  }),
  transactionTags: many(transactionTags),
}));

export const transactionTagsRelations = relations(transactionTags, ({ one }) => ({
  transaction: one(transactions, {
    fields: [transactionTags.transactionId],
    references: [transactions.id],
  }),
  tag: one(tags, {
    fields: [transactionTags.tagId],
    references: [tags.id],
  }),
}));
