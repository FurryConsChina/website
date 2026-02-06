import * as z from "zod/v4";

export const FeatureSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string().nullable(),
});
