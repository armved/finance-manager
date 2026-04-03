import { z } from "zod";
import { dateStringSchema } from "./common";

export const dateRangeSchema = z.object({
  start: dateStringSchema,
  end: dateStringSchema,
});

export type DateRange = z.infer<typeof dateRangeSchema>;
