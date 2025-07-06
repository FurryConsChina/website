import { FeatureSchema } from "@/types/feature";
import { z } from "zod";

/** Sync with https://schema.org/EventStatusType */
export const EventStatus = {
  /** 活动已取消。 */
  EventCancelled: "cancelled",
  /** 活动已从现场参加转为线上参加。 */
  EventMovedOnline: "movedOnline",
  /** 活动已推迟到未来的某个日期，但具体日期未知。 */
  EventPostponed: "postponed",
  /** 活动已重新安排到未来的某个日期。 */
  EventRescheduled: "rescheduled",
  /** 活动按计划举办。 */
  EventScheduled: "scheduled",
};

export const EventStatusSchema = {
  [EventStatus.EventCancelled]: "https://schema.org/EventCancelled",
  [EventStatus.EventMovedOnline]: "https://schema.org/EventMovedOnline",
  [EventStatus.EventPostponed]: "https://schema.org/EventPostponed",
  [EventStatus.EventRescheduled]: "https://schema.org/EventRescheduled",
  [EventStatus.EventScheduled]: "https://schema.org/EventScheduled",
};

export const EventScale = {
  /** 小型聚会，个人举办的展会一般用这个。 */
  Cosy: "cosy",
  /** 二三线城市的展会一般用这个。 */
  Small: "small",
  /** 一线城市的展会但是不是很有名一般用这个，比如：上海兽界 */
  Medium: "medium",
  /** 以极兽聚为代表的超过1000人以上的展会 */
  Large: "large",
  /** 特大型展会 */
  XLarge: "xlarge",
  /**超特大型展会 */
  XXLarge: "xxlarge",
  /** 巨型展会，没有这种规模 */
  Mega: "mega",
};

export const EventLocationType = {
  /** 在酒店举办的展会 */
  Hotel: "hotel",
  /** 在专用活动场地举办的展会 */
  Venue: "venue",
  /** 线上活动，叮咚鸡！ */
  Online: "online",
};

export const EventTypeMap = {
  /** 有毛又有销售摊位，比如极兽聚夏聚 */
  AllInCon: "all-in-con",
  /** 贩售会，主要在台湾和日本，以卖本子为主 */
  ComicMarket: "comic-market",
  /** 纯吸毛展，比如极兽聚冬聚 */
  SuitOnlyCon: "suit-only-con",
  /** 主打旅游的展子，行程里包含旅游等安排。 */
  TravelCon: "travel-con",
  /** 类似粉丝见面会和同城交友的类型，比如岚兽聚，这种展会的显著特点是：展会主动选择（筛选）访客。 */
  FandomMeetup: "fandom-meetup",
};

export const EventSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  startAt: z.string().datetime().nullable(),
  endAt: z.string().datetime().nullable(),
  status: z.string(),
  scale: z.string(),
  type: z
    .enum([
      EventTypeMap.AllInCon,
      EventTypeMap.ComicMarket,
      EventTypeMap.SuitOnlyCon,
      EventTypeMap.TravelCon,
      EventTypeMap.FandomMeetup,
    ])
    .nullable(),
  locationType: z
    .enum([
      EventLocationType.Hotel,
      EventLocationType.Venue,
      EventLocationType.Online,
    ])
    .nullable(),
  source: z.string().nullable(),
  address: z.string().nullable(),
  addressLat: z.string().nullable(),
  addressLon: z.string().nullable(),
  addressExtra: z.object({ city: z.string().nullable() }).nullable(),
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
  thumbnail: z.string().nullable(),
  poster: z
    .object({
      all: z.array(z.string()).nullable(),
    })
    .nullable(),
  detail: z.string().nullable(),
  features: z.object({ self: z.array(z.string()).nullish() }).nullish(),
  commonFeatures: z.array(FeatureSchema).nullish(),

  organization: z.object({
    id: z.string().uuid(),
    slug: z.string().min(1),
    name: z.string().min(1),
    description: z.string().nullable(),
    status: z.enum(["active", "inactive"]),
    type: z.string().nullable(),

    logoUrl: z.string().nullable(),
    richMediaConfig: z.any().nullable(),
    contactMail: z.string().email().nullable(),
    website: z.string().url().nullable(),
    twitter: z.string().url().nullable(),
    weibo: z.string().url().nullable(),
    qqGroup: z.string().nullable(),
    bilibili: z.string().url().nullable(),
    wikifur: z.string().url().nullable(),
    facebook: z.string().url().nullable(),
    plurk: z.string().url().nullable(),
    rednote: z.string().url().nullable(),
    creationTime: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format",
      })
      .nullable(), // creationTime 应该是一个有效的日期字符串
  }),
});

export type EventType = z.infer<typeof EventSchema>;
