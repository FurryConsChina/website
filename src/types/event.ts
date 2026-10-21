import { EventLocationType, EventTypeMap } from "@/constants/event";
import { FeatureSchema } from "@/types/feature";
import { OrganizationSchema } from "@/types/organization";
import { RegionSchema } from "@/types/region";
import * as z from "zod/v4";

const MediaItemSchema = z.object({
  url: z.string(),
  title: z.string().nullish(),
  description: z.string().nullish(),
});

export const EventOrganizerSchema = z.object({
  isPrimary: z.boolean(),
  sortOrder: z.number(),
  organization: OrganizationSchema,
});

export type EventOrganizer = z.infer<typeof EventOrganizerSchema>;

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

const EventBenefitSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  category: z.string().nullable(),
  sortOrder: z.number(),
});

const OfferSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  availability: z.enum(["upcoming", "onSale", "soldOut", "ended"]),
  // 后端 PG decimal 以字符串读取，避免浮点精度丢失。
  price: z.string().nullable(),
  priceNote: z.string().nullable(),
  saleStartAt: z.iso.datetime().nullable(),
  saleEndAt: z.iso.datetime().nullable(),
  admissionDates: z.array(z.string()).nullable(),
  sortOrder: z.number(),
  currency: z.string(),
  benefitLinks: z.array(
    z.object({
      offerId: z.string(),
      benefitId: z.string(),
      quantity: z.number().nullable(),
      note: z.string().nullable(),
      createdAt: z.iso.datetime(),
      updatedAt: z.iso.datetime(),
      benefit: EventBenefitSchema,
    }),
  ),
});

const ProfileLinkSchema = z.object({
  id: z.string(),
  profileId: z.string(),
  type: z.string(),
  label: z.string().nullable(),
  value: z.string(),
  sortOrder: z.number(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

const ProfileSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  kind: z.enum(["individual", "group", "brand", "media"]),
  status: z.enum(["active", "inactive"]),
  description: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  contactMail: z.string().nullable(),
  links: z.array(ProfileLinkSchema),
});

const EventParticipantSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  profileId: z.string().nullable(),
  organizationId: z.string().nullable(),
  role: z.enum(["guest", "exhibitor", "sponsor", "media"]),
  description: z.string().nullable(),
  booth: z.string().nullable(),
  tier: z.string().nullable(),
  isFeatured: z.boolean(),
  sortOrder: z.number(),
  appearanceDates: z.array(z.string()).nullable(),
  profile: ProfileSchema.nullable(),
  organization: OrganizationSchema.nullable(),
});

// 后端写入侧只约束 overrideOrganizationContact，JSONB 列里可能还有历史遗留的其他键。
const EventExtraSchema = z.looseObject({
  overrideOrganizationContact: z
    .object({
      qqGroups: z.array(z.object({ label: z.string().optional(), value: z.string() })).optional(),
    })
    .optional(),
});

export const EventSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  urlKey: z.string(),
  eventKey: z.string(),
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
    .nullish(),
  locationNotes: z.string().nullable(),
  thumbnail: z.string().nullable(),
  detail: z.string().nullish(),
  extra: EventExtraSchema.nullable(),
  media: z
    .object({
      images: z.array(MediaItemSchema).optional(),
      videos: z.array(MediaItemSchema).optional(),
      lives: z.array(MediaItemSchema).optional(),
    })
    .nullish(),
  region: RegionSchema.nullable(),
  place: PlaceSchema.nullable(),
  organizers: z.array(EventOrganizerSchema),
  features: z.array(FeatureSchema),
  offers: z.array(OfferSchema),
  benefits: z.array(EventBenefitSchema),
  participants: z.array(EventParticipantSchema),
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
