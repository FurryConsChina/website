import { z } from "zod";

export const OrganizationStatus = {
  Active: "active",
  Inactive: "inactive",
};

export const OrganizationSchema = z.object({
  id: z.uuid(),
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullish(),
  status: z.enum(OrganizationStatus),
  type: z.string().nullish(),
  logoUrl: z.string().nullish(),
  richMediaConfig: z.any().nullish(),
  contactMail: z.email().nullish(),
  website: z.url().nullish(),
  twitter: z.url().nullish(),
  weibo: z.url().nullish(),
  qqGroup: z.string().nullish(),
  bilibili: z.url().nullish(),
  wikifur: z.url().nullish(),
  facebook: z.url().nullish(),
  plurk: z.url().nullish(),
  rednote: z.url().nullish(),
  creationTime: z.iso.datetime().nullish(),
});

export type OrganizationType = z.infer<typeof OrganizationSchema>;
