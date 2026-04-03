import { z } from "zod";
import {
  transactionTypeSchema,
  monetaryAmountSchema,
  dateStringSchema,
} from "./common";

export const createTransactionSchema = z.object({
  type: transactionTypeSchema,
  amount: monetaryAmountSchema,
  transactionDate: dateStringSchema.optional(),
  accountId: z.string().uuid("Invalid account ID").optional(),
  categoryId: z.string().uuid("Invalid category ID"),
  merchantId: z.string().uuid("Invalid merchant ID").nullish(),
  tagIds: z.array(z.string().uuid("Invalid tag ID")).optional(),
});

// Omit accountId (can't move a transaction between accounts after creation),
// then make everything else optional for partial updates.
export const updateTransactionSchema = createTransactionSchema
  .omit({ accountId: true })
  .partial();

export const transactionFiltersSchema = z.object({
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional(),
  type: transactionTypeSchema.optional(),
  categoryId: z.string().uuid().optional(),
  accountId: z.string().uuid().optional(),
  merchantId: z.string().uuid().optional(),
  tagId: z.string().uuid().optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionFilters = z.infer<typeof transactionFiltersSchema>;
