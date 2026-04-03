import { z } from "zod";
import { nameSchema, iconSchema } from "./common";

export const createMerchantSchema = z.object({
  name: nameSchema,
  icon: iconSchema,
});

// All fields are optional for partial updates.
export const updateMerchantSchema = createMerchantSchema.partial();

export type CreateMerchantInput = z.infer<typeof createMerchantSchema>;
export type UpdateMerchantInput = z.infer<typeof updateMerchantSchema>;
