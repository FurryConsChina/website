import { OrganizationStatus } from "@/constants/organization";
import * as z from "zod/v4";

export const OrganizationLinkSchema = z.object({
  type: z.string(),
  label: z.string().nullable(),
  value: z.string(),
  sortOrder: z.number(),
});

export const OrganizationSchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  status: z.enum(OrganizationStatus),
  type: z.string().nullable(),
  logoUrl: z.string().nullable(),
  contactMail: z.email().nullable(),
  foundedOn: z.iso.datetime().nullable(),
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
