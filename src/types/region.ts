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
  parentId: z.uuid().nullish(),
  parent: z
    .object({
      id: z.uuid(),
      name: z.string(),
      code: z.string(),
      type: z.enum(RegionType),
      level: z.number(),
      parentId: z.uuid().nullish(),
      countryCode: z.string().nullish(),
      isOverseas: z.boolean(),
      addressFormat: z.string().nullish(),
      localName: z.string().nullish(),
      timezone: z.string().nullish(),
      languageCode: z.string().nullish(),
      currencyCode: z.string().nullish(),
      phoneCode: z.string().nullish(),
      latitude: z.number().nullish(),
      longitude: z.number().nullish(),
      sortOrder: z.number().nullish(),
      remark: z.string().nullish(),
      createdAt: z.iso.datetime(),
      updatedAt: z.iso.datetime(),
    })
    .nullable(),
  countryCode: z.string().nullish(),
  isOverseas: z.boolean(),
  addressFormat: z.string().nullish(),
  localName: z.string().nullish(),
  timezone: z.string().nullish(),
  languageCode: z.string().nullish(),
  currencyCode: z.string().nullish(),
  phoneCode: z.string().nullish(),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
  sortOrder: z.number(),
  remark: z.string().nullish(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type Region = z.infer<typeof RegionSchema>;
