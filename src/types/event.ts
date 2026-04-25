import { EventLocationType, EventTypeMap } from "@/constants/event";
import { FeatureSchema } from "@/types/feature";
import { OrganizationSchema } from "@/types/organization";
import * as z from "zod/v4";

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

  organization: OrganizationSchema,
  organizations: z.array(OrganizationSchema),
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
  organizations: { slug: string; name: string }[];
  features?: { self?: string[] | null } | null;
  commonFeatures?: { name: string }[] | null;
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
