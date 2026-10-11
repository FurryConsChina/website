import { RegionType } from "@/constants/region";
import * as z from "zod/v4";

export const RegionSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  kind: z.enum(RegionType),
  parentId: z.uuid().nullable(),
  localName: z.string().nullable(),
  timezone: z.string().nullable(),
  isoCode: z.string().nullable(),
  displayOrder: z.number(),
});

export type Region = z.infer<typeof RegionSchema>;

/** 地区列表/详情接口的返回项，附带父级地区和热度。 */
export type RegionListItem = Region & {
  parent: Region | null;
  heatScore: number;
};
