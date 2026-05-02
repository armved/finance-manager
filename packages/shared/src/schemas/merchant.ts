import { z } from "zod";
import { nameSchema } from "./common";

export const createMerchantSchema = z.object({
  name: nameSchema,
});

// All fields are optional for partial updates.
export const updateMerchantSchema = createMerchantSchema.partial();

export type CreateMerchantInput = z.infer<typeof createMerchantSchema>;
export type UpdateMerchantInput = z.infer<typeof updateMerchantSchema>;
