import { RegionAPI } from "@/api/region";
import { RegionType } from "@/constants/region";
import type { RegionListItem } from "@/types/region";
import { CityPageMeta } from "@/utils/meta";
import { currentSupportLocale } from "@/utils/locale";
import { breadcrumbGenerator } from "@/utils/structuredData";
import { sendTrack } from "@/utils/track";
import { groupBy } from "es-toolkit";
import type { GetServerSidePropsContext } from "next";
import { getLayoutProps } from "@/utils/layoutProps";
import Link from "next/link";
import { FaLink } from "react-icons/fa6";
import { useTranslation } from "next-i18next/pages";

export default function City(props: { regionGroups: Record<string, RegionListItem[]> }) {
  const { regionGroups } = props;
  const { t } = useTranslation();

  const groupKeys = Object.keys(regionGroups).sort((a, b) => {
    const aHasParent = !!regionGroups[a][0].parent;
    const bHasParent = !!regionGroups[b][0].parent;
    if (aHasParent && !bHasParent) return -1;
    if (!aHasParent && bHasParent) return 1;
    return 0;
  });

  return (
    <>
      <div className="bg-white shadow-sm p-4 sm:p-6 rounded-xl">
        {groupKeys.map((groupKey) => {
          const groupName = (() => {
            if (groupKey === "china") {
              return t("city.group.china");
            }

            const firstRegion = regionGroups[groupKey][0];
            if (firstRegion.parent?.slug === groupKey) {
              return firstRegion.parent.name;
            }
            if (groupKey === "special") return t("city.group.special");
            return t("city.group.other");
          })();

          return (
            <div key={groupKey} className="mb-6 sm:mb-8 last:mb-0">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 border-b pb-2">
                {groupName}
                <span className="text-sm sm:text-base font-normal text-gray-500 ml-1">
                  {t("city.group.count", {
                    count: regionGroups[groupKey].length,
                  })}
                </span>
              </h3>
              <ul className="grid grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
                {regionGroups[groupKey]
                  .sort((a, b) => b.displayOrder - a.displayOrder)
                  .map((region) => (
                    <li key={region.id} className="group">
                      <Link
                        href={`/city/${region.slug}`}
                        className="block rounded-lg bg-gray-50 sm:bg-transparent border border-gray-100 sm:border-transparent px-2.5 py-2 sm:p-0 active:bg-red-50 transition"
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
                        <h2 className="text-sm sm:text-lg font-bold text-gray-600 flex items-center justify-center sm:justify-start group-hover:text-red-400 transition duration-300">
                          <FaLink className="hidden sm:inline-block h-3 w-3 mr-1 shrink-0" />
                          <span className="truncate">{region.name}</span>
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

export async function getServerSideProps({ locale, res }: { locale: string; res: GetServerSidePropsContext["res"] }) {
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=300");

  const [regions, layoutProps] = await Promise.all([
    RegionAPI.getRegionList({
      current: 1,
      pageSize: 100,
      withEvents: true,
    }),
    getLayoutProps(locale),
  ]);

  const regionWithoutCountry = regions.records.filter((item) => item.kind !== RegionType.COUNTRY);

  const regionGroups = groupBy(regionWithoutCountry, (item) => {
    if (["xianggang", "aomen"].includes(item.slug)) {
      return "special";
    }

    // 如果有父级地区，使用父级的 slug 作为分组 key
    if (item.parent?.slug) {
      return item.parent.slug;
    }
    // 如果没有父级，归类到"other"组
    return "other";
  });

  return {
    props: {
      regionGroups: regionGroups,
      headMetas: {
        title: CityPageMeta[locale as currentSupportLocale].title,
        des: CityPageMeta[locale as currentSupportLocale].description(regions.total),
        url: "/city",
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
      ...layoutProps,
    },
  };
}
