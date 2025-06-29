import { API } from "./index";
import { z } from "zod";
import { EventType, EventSchema } from "@/types/event";
import { FeatureSchema } from "@/types/feature";

// 事件数据验证 schema - 使用现有的 EventSchema
const HomeEventSchema = EventSchema;

const CityResponseSchema = EventSchema.pick({
  name: true,
  slug: true,
  thumbnail: true,
  poster: true,
  startAt: true,
  endAt: true,
  addressExtra: true,
}).merge(
  z.object({
    organization: EventSchema.shape.organization.pick({
      name: true,
      slug: true,
    }),
  })
);

const YearResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  addressExtra: z.object({ city: z.string().nullable() }).nullable(),
  startAt: z.string().datetime().nullable(),
  endAt: z.string().datetime().nullable(),
  organization: z.object({
    name: z.string(),
    slug: z.string(),
  }),
});

const SitemapEventSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  addressExtra: z.object({ city: z.string().nullable() }).nullable(),
  startAt: z.string().datetime().nullable(),
  endAt: z.string().datetime().nullable(),
  organization: z.object({
    name: z.string(),
    slug: z.string(),
  }),
});

// 定义返回类型
type HomeEventType = EventType;
type CityEventType = z.infer<typeof CityResponseSchema>;
type YearEventType = z.infer<typeof YearResponseSchema>;
type SitemapEventType = z.infer<typeof SitemapEventSchema>;

// API 函数
export const eventsAPI = {
  // 获取首页事件列表
  async getHomeEvents(): Promise<HomeEventType[]> {
    const response = await API.get("internal/cms/event/home").json();
    const validEvents = z.array(HomeEventSchema).safeParse(response);
    return validEvents.data || [];
  },

  // 获取所有事件列表
  async getAllEvents(): Promise<HomeEventType[]> {
    const response = await API.get("internal/cms/event/all").json();
    const validEvents = z.array(HomeEventSchema).safeParse(response);
    return validEvents.data || [];
  },

  // 获取城市页面事件列表
  async getCityEvents(): Promise<CityEventType[]> {
    const response = await API.get("internal/cms/event/all").json();
    const validEvents = z.array(CityResponseSchema).safeParse(response);
    return validEvents.data || [];
  },

  // 获取年度页面事件列表
  async getYearEvents(): Promise<YearEventType[]> {
    const response = await API.get("internal/cms/event/all").json();
    const validEvents = z.array(YearResponseSchema).safeParse(response);
    return validEvents.data || [];
  },

  // 获取站点地图事件列表
  async getSitemapEvents(): Promise<SitemapEventType[]> {
    const response = await API.get("internal/cms/event/all").json();
    const validEvents = z.array(SitemapEventSchema).safeParse(response);
    return validEvents.data || [];
  },

  // 获取事件详情
  async getEventDetail(slug: string, organization: string): Promise<EventType> {
    const response = await API.get("open/v1/event/detail", {
      searchParams: { slug, organization },
    }).json();
    
    const validEvent = EventSchema.safeParse(response);
    
    if (!validEvent.success) {
      throw new Error(`Invalid event detail response: ${validEvent.error}`);
    }
    
    return validEvent.data;
  },
}; 