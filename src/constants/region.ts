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
