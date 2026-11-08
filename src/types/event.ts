import { EventLocationType, EventTypeMap } from "@/constants/event";
import { FeatureSchema } from "@/types/feature";
import { OrganizationLinkSchema, OrganizationSummarySchema } from "@/types/organization";
import { RegionSchema } from "@/types/region";
import * as z from "zod/v4";

const MediaItemSchema = z.object({
  url: z.string(),
  title: z.string().nullish(),
  description: z.string().nullish(),
});

const PlaceSchema = z.object({
  id: z.string(),
  regionId: z.string(),
  name: z.string(),
  kind: z.string(),
  subtype: z.string().nullable(),
  address: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  timezone: z.string().nullable(),
  coordinateSource: z.string().nullable(),
  sourceCoordinateSystem: z.string().nullable(),
  sourcePlaceId: z.string().nullable(),
});

const OfferSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  availability: z.enum(["upcoming", "onSale", "soldOut", "ended"]),
  // 后端 PG decimal 以字符串读取，避免浮点精度丢失。
  price: z.string().nullable(),
  priceNote: z.string().nullable(),
  saleStartAt: z.iso.datetime().nullable(),
  saleEndAt: z.iso.datetime().nullable(),
  admissionDates: z.array(z.string()).nullable(),
  currency: z.string(),
  benefits: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().nullable(),
      category: z.string().nullable(),
      sortOrder: z.number(),
      quantity: z.number().nullable(),
      note: z.string().nullable(),
    }),
  ),
});

// 后端写入侧只约束 overrideOrganizationContact，JSONB 列里可能还有历史遗留的其他键。
const EventExtraSchema = z.looseObject({
  overrideOrganizationContact: z
    .object({
      qqGroups: z.array(z.object({ label: z.string().optional(), value: z.string() })).optional(),
    })
    .optional(),
});

const EventBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  urlKey: z.string(),
  startAt: z.iso.datetime().nullable(),
  endAt: z.iso.datetime().nullable(),
  status: z.string(),
  scale: z.string(),
  type: z.enum(EventTypeMap).nullable(),
  sources: z
    .array(
      z.object({
        url: z.string(),
        name: z.string().nullish(),
        description: z.string().nullish(),
      }),
    )
    .nullable(),
  ticketChannels: z
    .array(
      z.object({
        type: z.enum(["wxMiniProgram", "url", "qrcode", "app"]),
        name: z.string(),
        url: z.string(),
        available: z.boolean(),
      }),
    )
    .nullable(),
  thumbnail: z.string().nullable(),
  detail: z.string().nullable(),
  extra: EventExtraSchema.nullable(),
  media: z
    .object({
      images: z.array(MediaItemSchema).optional(),
      videos: z.array(MediaItemSchema).optional(),
      lives: z.array(MediaItemSchema).optional(),
    })
    .nullable(),
  features: z.array(FeatureSchema),
});

export const EventListItemSchema = z.object({
  ...EventBaseSchema.shape,
  slug: z.string(),
  eventKey: z.string(),
  locationType: z.enum(EventLocationType).nullable(),
  locationNotes: z.string().nullable(),
  region: RegionSchema.nullable(),
  place: PlaceSchema.nullable(),
  organizers: z.array(
    z.object({
      isPrimary: z.boolean(),
      sortOrder: z.number(),
      organization: OrganizationSummarySchema,
    }),
  ),
});

export type EventListItem = z.infer<typeof EventListItemSchema>;

export const EventSchema = z.object({
  ...EventBaseSchema.shape,
  location: z.object({
    type: z.enum(EventLocationType).nullable(),
    note: z.string().nullable(),
    region: RegionSchema.pick({ name: true, localName: true, slug: true }).nullable(),
    place: PlaceSchema.pick({ name: true, address: true, latitude: true, longitude: true }).nullable(),
  }),
  organizers: z.array(
    z.object({
      isPrimary: z.boolean(),
      organization: z.object({
        ...OrganizationSummarySchema.pick({
          slug: true,
          name: true,
          logoUrl: true,
          status: true,
          contactMail: true,
        }).shape,
        links: z.array(OrganizationLinkSchema.pick({ type: true, label: true, value: true })),
      }),
    }),
  ),
  offers: z.array(OfferSchema),
});

export type EventItem = z.infer<typeof EventSchema>;

export type EventCardItem = {
  id: string;
  urlKey: string;
  name: string;
  startAt: string | null;
  endAt: string | null;
  scale: string;
  type: string | null;
  locationType: string | null;
  address: string | null;
  region: { localName: string | null } | null;
  organization: { slug: string; name: string } | null;
  organizations: { slug: string; name: string }[];
  features: { name: string }[];
  thumbnail?: string | null;
  media?: { images?: { url: string }[] } | null;
};

export type SimpleEventItem = {
  id: string;
  urlKey: string;
  name: string;
  startAt: string | null;
  endAt: string | null;
  scale: string;
  region: { localName: string | null } | null;
  organization: { slug: string; name: string } | null;
};
