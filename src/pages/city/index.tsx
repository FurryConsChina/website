import { RegionAPI } from "@/api/region";
import { Region, RegionType } from "@/types/region";
import { CityPageMeta } from "@/utils/meta";
import { currentSupportLocale } from "@/utils/locale";
import { breadcrumbGenerator } from "@/utils/structuredData";
import { sendTrack } from "@/utils/track";
import { groupBy } from "es-toolkit";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { FaLink } from "react-icons/fa6";
import { useTranslation } from "next-i18next";

export default function City(props: { regionGroups: Record<string, Region[]> }) {
  const { regionGroups } = props;
  const { t } = useTranslation();

  const groupKeys = Object.keys(regionGroups).sort((a, b) => {
    const aIsParentGroup = regionGroups[a][0].parent?.sortOrder;
    const bIsParentGroup = regionGroups[b][0].parent?.sortOrder;
    if (aIsParentGroup && !bIsParentGroup) return -1;
    if (!aIsParentGroup && bIsParentGroup) return 1;
    return 0;
  });

  return (
    <>
      <div className="bg-white border p-6 rounded-xl">
        {groupKeys.map((groupKey) => {
          const groupName = (() => {
            if (groupKey === "china") {
              return t("city.group.china");
            }

            const firstRegion = regionGroups[groupKey][0];
            if (firstRegion.parent?.code === groupKey) {
              return firstRegion.parent.name;
            }
            if (groupKey === "special") return t("city.group.special");
            return t("city.group.other");
          })();

          return (
            <div key={groupKey} className="mb-8 last:mb-0">
              <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                {groupName}
                {t("city.group.count", {
                  count: regionGroups[groupKey].length,
                })}
              </h3>
              <ul className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {regionGroups[groupKey]
                  .sort((a, b) => b.sortOrder - a.sortOrder)
                  .map((region) => (
                    <li key={region.id} className="group">
                      <Link
                        href={`/city/${region.code}`}
                        onClick={() =>
                          sendTrack({
                            eventName: "click-city-jump-link",
                            eventValue: {
                              value: region.name,
                              from: "city list",
                            },
                          })
                        }
                      >
                        <h2 className="text-lg font-bold text-gray-600 flex items-center group-hover:text-red-400 transition duration-300">
                          <FaLink className="inline-block h-3 w-3 mr-1" />
                          {region.name}
                        </h2>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          );
        })}
      </div>
    </>
  );
}

export async function getServerSideProps({ locale }: { locale: string }) {
  const regions = await RegionAPI.getRegionList({
    current: 1,
    pageSize: 100,
    withEvents: true,
  });

  const regionWithoutCountry = regions.records.filter((item) => item.type !== RegionType.COUNTRY);

  const regionGroups = groupBy(regionWithoutCountry, (item) => {
    if (["xianggang", "aomen"].includes(item.code)) {
      return "special";
    }

    // 如果有父级地区，使用父级的code作为分组key
    if (item.parent?.code) {
      return item.parent.code;
    }
    // 如果没有父级但有国家代码，使用国家代码
    if (item.countryCode) {
      return item.countryCode;
    }
    // 如果都没有，归类到"other"组
    return "other";
  });

  return {
    props: {
      regionGroups: regionGroups,
      headMetas: {
        title: CityPageMeta[locale as currentSupportLocale].title,
        des: CityPageMeta[locale as currentSupportLocale].description(regions.total),
        link: "/city",
      },
      structuredData: {
        ...breadcrumbGenerator({
          items: [
            {
              name: CityPageMeta[locale as currentSupportLocale].title,
              item: "/city",
            },
          ],
        }),
      },
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
