import { z } from "zod";

export enum RegionType {
  COUNTRY = "country",
  STATE = "state",
  CITY = "city",
  DISTRICT = "district",
}

export const RegionTypeLabel = {
  [RegionType.COUNTRY]: "国家",
  [RegionType.STATE]: "省份",
  [RegionType.CITY]: "城市",
  [RegionType.DISTRICT]: "区县",
};

export const RegionSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  code: z.string(),
  type: z.enum(RegionType),
  level: z.number(),
  parentId: z.uuid().nullable(),
  parent: z
    .object({
      id: z.uuid(),
      name: z.string(),
      code: z.string(),
      type: z.enum(RegionType),
      level: z.number(),
      parentId: z.uuid().nullable(),
      countryCode: z.string().nullable(),
      isOverseas: z.boolean(),
      addressFormat: z.string().nullable(),
      localName: z.string().nullable(),
      timezone: z.string().nullable(),
      languageCode: z.string().nullable(),
      currencyCode: z.string().nullable(),
      phoneCode: z.string().nullable(),
      latitude: z.number().nullable(),
      longitude: z.number().nullable(),
      sortOrder: z.number().nullable(),
      remark: z.string().nullable(),
      createdAt: z.iso.datetime(),
      updatedAt: z.iso.datetime(),
    })
    .nullable(),
  countryCode: z.string().nullable(),
  isOverseas: z.boolean(),
  addressFormat: z.string().nullable(),
  localName: z.string().nullable(),
  timezone: z.string().nullable(),
  languageCode: z.string().nullable(),
  currencyCode: z.string().nullable(),
  phoneCode: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  sortOrder: z.number(),
  remark: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type Region = z.infer<typeof RegionSchema>;
