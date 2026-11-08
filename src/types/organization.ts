import { OrganizationStatus } from "@/constants/organization";
import type { EventListItem } from "@/types/event";
import * as z from "zod/v4";

export const OrganizationLinkSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  type: z.string(),
  label: z.string().nullable(),
  value: z.string(),
  sortOrder: z.number(),
  // 后端的 OrganizationLink 继承 Lucid 原生 BaseModel，嵌套序列化时会带上时间戳。
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const OrganizationSummarySchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  status: z.enum(OrganizationStatus),
  type: z.string().nullable(),
  logoUrl: z.string().nullable(),
  contactMail: z.email().nullable(),
  foundedOn: z.iso.datetime().nullable(),
});

export const OrganizationSchema = z.object({
  ...OrganizationSummarySchema.shape,
  links: z.array(OrganizationLinkSchema),
});

export type Organization = z.infer<typeof OrganizationSchema>;

export type OrganizationListItem = {
  id: string;
  slug: string;
  name: string;
  status: string;
  logoUrl: string | null;
};

/** 组织活动接口的活动项：后端会去掉 detail/media/ticketChannels，并附带该组织的参与类型。 */
export type OrganizationEventItem = Omit<EventListItem, "detail" | "media" | "ticketChannels"> & {
  activityType:
    | "hosted"
    | "participated:guest"
    | "participated:exhibitor"
    | "participated:sponsor"
    | "participated:media";
};
