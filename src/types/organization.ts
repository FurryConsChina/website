import { z } from "zod";

export const OrganizationStatus = {
  Active: "active",
  Inactive: "inactive",
};

export const OrganizationSchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  status: z.enum(OrganizationStatus),
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
  creationTime: z.iso.datetime().nullable(),
});

export type Organization = z.infer<typeof OrganizationSchema>;
