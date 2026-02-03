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
  startAt: z.iso.datetime().nullable(),
  endAt: z.iso.datetime().nullable(),
  status: z.string(),
  scale: z.string(),
  type: z.enum(EventTypeMap).nullable(),
  locationType: z.enum(EventLocationType).nullable(),
  sources: z
    .array(
      z.object({
        url: z.string(),
        name: z.string().nullable(),
        description: z.string().nullable(),
      }),
    )
    .nullable(),
  ticketChannels: z
    .array(
      z.object({
        type: z.enum(["wxMiniProgram", "url", "qrcode", "app"]),
        name: z.string(),
        url: z.string().nullable(),
        available: z.boolean().nullable(),
      }),
    )
    .nullable(),
  address: z.string().nullable(),
  addressLat: z.string().nullable(),
  addressLon: z.string().nullable(),
  region: z
    .object({
      name: z.string(),
      code: z.string(),
      type: z.string(),
      level: z.number(),
      localName: z.string().nullable(),
      sortOrder: z.number().nullable(),
    })
    .nullable(),
  thumbnail: z.string().nullable(),
  detail: z.string().nullable(),
  media: z
    .object({
      images: z
        .array(
          z.object({
            url: z.string(),
            title: z.string().nullable(),
            description: z.string().nullable(),
          }),
        )
        .optional(),
      videos: z
        .array(
          z.object({
            url: z.string(),
            title: z.string().nullable(),
            description: z.string().nullable(),
          }),
        )
        .optional(),
      lives: z
        .array(
          z.object({
            url: z.string(),
            title: z.string().nullable(),
            description: z.string().nullable(),
          }),
        )
        .optional(),
    })
    .optional(),
  features: z.object({ self: z.array(z.string()).nullish() }).nullish(),
  commonFeatures: z.array(FeatureSchema).nullish(),

  organization: z.object({
    id: z.uuid(),
    slug: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    status: z.enum(["active", "inactive"]),
    type: z.string().nullable(),
    logoUrl: z.string().nullable(),
    richMediaConfig: z.any().nullable(),
    contactMail: z.email().nullable(),
    website: z.url().nullable(),
    twitter: z.url().nullable(),
    weibo: z.url().nullable(),
    qqGroup: z.string().nullable(),
    bilibili: z.url().nullable(),
    wikifur: z.url().nullable(),
    facebook: z.url().nullable(),
    plurk: z.url().nullable(),
    rednote: z.url().nullable(),
    creationTime: z.iso.datetime(),
  }),
});

export type EventItem = z.infer<typeof EventSchema>;

export type EventCardItem = {
  id: string;
  slug: string;
  name: string;
  startAt: string | null;
  endAt: string | null;
  scale: string;
  type: string | null;
  locationType: string | null;
  address: string | null;
  region: { localName: string | null } | null;
  organization: { slug: string; name: string };
  features?: { self?: string[] | null } | null;
  commonFeatures?: { name: string }[] | null;
  thumbnail?: string | null;
  media?: { images?: { url: string }[] } | null;
};
