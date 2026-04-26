import { z } from "zod";
import { categoryTypeSchema, nameSchema, iconSchema, colorSchema } from "./common";

export const createCategorySchema = z.object({
  name: nameSchema.max(100),
  parentId: z.string().uuid("Invalid parent category ID").nullish(),
  type: categoryTypeSchema,
  sortOrder: z.number().int().nonnegative().optional().default(0),
  icon: iconSchema,
  color: colorSchema,
});

// Update omits parentId (re-parenting is a separate "move" operation)
// and makes everything else optional.
export const updateCategorySchema = createCategorySchema
  .omit({ parentId: true })
  .partial();

export const deleteCategoryQuerySchema = z.object({
  reassignToCategoryId: z.string().uuid("Invalid category ID").optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type DeleteCategoryQuery = z.infer<typeof deleteCategoryQuerySchema>;
