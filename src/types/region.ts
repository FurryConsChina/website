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

/** 地区列表/详情接口的返回项，附带父级地区和公开活动数。 */
export type RegionListItem = Region & {
  parent: Region | null;
  eventCount: number;
  /** 仅当请求参数 withEvents=true 时返回，每个地区最多 3 条近期公开活动。 */
  event?: {
    name: string;
    slug: string;
    urlKey: string;
    eventKey: string;
    startAt: string | null;
    endAt: string | null;
    thumbnail: string | null;
    status: string;
    /** 后端此处按旧结构输出，键名为 snake_case。 */
    event_organization: {
      organizationId: string;
      organization: { slug?: string };
    }[];
  }[];
};
