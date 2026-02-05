import { Region } from "@/types/region";
import { currentSupportLocale } from "@/utils/meta";

export function getRegionName(region: Region, currentLocale: currentSupportLocale) {
  if (currentLocale === "zh-Hans") {
    return region.name;
  }
  return region.localName;
}
