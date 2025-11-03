import { z } from "zod";
import { EventItem, EventSchema } from "@/types/event";
import { ListResponse } from "@/types/api";
import API from "@/api";

const HomeEventSchema = EventSchema;

const YearResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  startAt: z.string().datetime().nullable(),
  endAt: z.string().datetime().nullable(),
  organization: z.object({
    name: z.string(),
    slug: z.string(),
  }),
  region: z
    .object({
      name: z.string(),
      code: z.string(),
      type: z.string(),
      level: z.number(),
      localName: z.string(),
      sortOrder: z.number(),
    })
    .nullable(),
});

const SitemapEventSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  region: z
    .object({
      name: z.string(),
      code: z.string(),
      type: z.string(),
      level: z.number(),
      localName: z.string(),
      sortOrder: z.number(),
    })
    .nullable(),
  startAt: z.string().datetime().nullable(),
  endAt: z.string().datetime().nullable(),
  organization: z.object({
    name: z.string(),
    slug: z.string(),
  }),
});

// 定义返回类型
type HomeEventType = EventItem;
type YearEventType = z.infer<typeof YearResponseSchema>;
type SitemapEventType = z.infer<typeof SitemapEventSchema>;

// API 函数
export const eventsAPI = {
  // 获取首页事件列表
  async getHomeEvents(): Promise<HomeEventType[]> {
    const response = await API.get("internal/website/home");
    const validEvents = z.array(HomeEventSchema).parse(response.data);
    return validEvents;
  },

  // 获取年度页面事件列表
  async getYearEvents(): Promise<YearEventType[]> {
    const response = await API.get("internal/website/event/all");
    const validEvents = z.array(YearResponseSchema).parse(response.data);
    return validEvents;
  },

  // 获取站点地图事件列表
  async getSitemapEvents(): Promise<SitemapEventType[]> {
    const response = await API.get("internal/website/event/all");
    const validEvents = z.array(SitemapEventSchema).parse(response.data);
    return validEvents;
  },

  // 获取事件详情
  async getEventDetail(slug: string, organization: string): Promise<EventItem> {
    const response = await API.get("internal/website/event/detail", {
      params: { slug, organization },
    });

    const validEvent = EventSchema.parse(response.data);

    return validEvent;
  },
};

export async function getEventList({
  current,
  pageSize,
  eventStartAt,
  eventEndAt,
  eventStatus,
  eventRegionCode,
  organizationSlug,
}: {
  current: string;
  pageSize: string;
  eventStartAt?: string;
  eventEndAt?: string;
  eventStatus?: string[];
  eventRegionCode?: string[];
  organizationSlug?: string[];
}) {
  const response = await API.post<ListResponse<EventItem>>(
    "/internal/cms/event/list",
    {
      current,
      pageSize,
      eventStartAt,
      eventEndAt,
      eventStatus,
      eventRegionCode,
      organizationSlug,
    }
  );

  return response.data;
}
