import { Region } from "@/types/region";
import { currentSupportLocale } from "@/utils/meta";

export function getRegionName(
  region: Region,
  currentLocale: currentSupportLocale
) {
  return region.localName || region.name;
}
