import { z } from "zod";

export const FeatureSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string().nullable(),
});
