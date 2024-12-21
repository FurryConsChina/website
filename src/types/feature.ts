import { z } from "zod";

export const FeatureSchema = z.object({
  id: z.string(),
  name: z.string().max(256),
  category: z.string().max(256),
  description: z.string().nullable(),
});
