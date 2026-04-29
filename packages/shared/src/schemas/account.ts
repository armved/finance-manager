import { z } from "zod";
import { nameSchema, monetaryAmountSchema } from "./common";

const balanceSchema = monetaryAmountSchema.or(z.literal(0));

export const createAccountSchema = z.object({
  name: nameSchema.max(100),
  currencyCode: z.string().length(3, "Currency code must be exactly 3 characters"),
  adjustedBalance: balanceSchema.optional().default(0),
});

export const updateAccountSchema = createAccountSchema
  .omit({ currencyCode: true })
  .partial()
  .extend({ isActive: z.boolean().optional() });

export const adjustBalanceSchema = z.object({
  balance: balanceSchema,
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type AdjustBalanceInput = z.infer<typeof adjustBalanceSchema>;
