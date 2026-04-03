import { z } from "zod";
import { nameSchema, colorSchema } from "./common";

export const createTagSchema = z.object({
  name: nameSchema.pipe(z.string().max(100)),
  color: colorSchema,
});

// All fields are optional for partial updates.
export const updateTagSchema = createTagSchema.partial();

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
