import * as z from "zod/v4";

export const FeatureSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string().nullable(),
  description: z.string().nullable(),
  isPublic: z.boolean(),
  sortOrder: z.number(),
});
