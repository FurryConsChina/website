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
  media: z
    .object({
      images: z.array(MediaItemSchema).optional(),
      videos: z.array(MediaItemSchema).optional(),
      lives: z.array(MediaItemSchema).optional(),
    })
    .nullish(),
  region: RegionSchema.nullable(),
  place: z
    .object({
      id: z.string(),
      name: z.string(),
      kind: z.string(),
      subtype: z.string().nullable(),
      address: z.string().nullable(),
      latitude: z.number().nullable(),
      longitude: z.number().nullable(),
    })
    .nullable(),
  organizers: z.array(EventOrganizerSchema),
  features: z.array(FeatureSchema),
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
  organization: { slug: string; name: string } | null;
  organizations: { slug: string; name: string }[];
  features: { name: string }[];
  thumbnail?: string | null;
  media?: { images?: { url: string }[] } | null;
};

export type SimpleEventItem = {
  id: string;
  slug: string;
  name: string;
  startAt: string | null;
  endAt: string | null;
  scale: string;
  region: { localName: string | null } | null;
  organization: { slug: string; name: string } | null;
};
