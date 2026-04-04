import { z } from "zod";
import { nameSchema, monetaryAmountSchema } from "./common";

export const createAccountSchema = z.object({
  name: nameSchema.max(100),
  currencyCode: z.string().length(3, "Currency code must be exactly 3 characters"),
  initialBalance: monetaryAmountSchema.or(z.literal(0)).optional().default(0),
});

// Update allows changing name & balance, adds isActive toggle.
// We omit currencyCode (shouldn't change after creation), then make everything optional,
// and extend with the update-only `isActive` field.
export const updateAccountSchema = createAccountSchema
  .omit({ currencyCode: true })
  .partial()
  .extend({ isActive: z.boolean().optional() });

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
