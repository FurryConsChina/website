import clsx from "clsx";
import { groupBy } from "es-toolkit";
import type { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useTranslation } from "next-i18next/pages";
import { useMemo, useState } from "react";
import { IoClose, IoSearch } from "react-icons/io5";

import { RegionAPI } from "@/api/region";
import Image from "@/components/Image";
import { RegionType } from "@/constants/region";
import { getEventCoverImgPath } from "@/utils/imageLoader";
import { getLayoutProps } from "@/utils/layoutProps";
import { currentSupportLocale } from "@/utils/locale";
import { CityPageMeta } from "@/utils/meta";
import { breadcrumbGenerator } from "@/utils/structuredData";
import { sendTrack } from "@/utils/track";

type CityDirectoryItem = {
  id: string;
  slug: string;
  name: string;
  eventCount: number;
  displayOrder: number;
  groupKey: string;
  parentName: string | null;
  latestEvent: {
    name: string;
    thumbnail: string | null;
  } | null;
};

type SortMode = "region" | "count";

const FEATURED_CITY_LIMIT = 6;

export default function City({ cities }: { cities: CityDirectoryItem[] }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("region");

  const featuredCities = useMemo(
    () =>
      [...cities]
        .sort((a, b) => b.eventCount - a.eventCount || b.displayOrder - a.displayOrder)
        .slice(0, FEATURED_CITY_LIMIT),
    [cities],
  );

  const trimmedQuery = query.trim().toLowerCase();

  const filteredCities = useMemo(() => {
    if (!trimmedQuery) return cities;
    return cities.filter(
      (city) => city.name.toLowerCase().includes(trimmedQuery) || city.slug.toLowerCase().includes(trimmedQuery),
    );
  }, [cities, trimmedQuery]);

  const sortedByCount = useMemo(
    () => [...filteredCities].sort((a, b) => b.eventCount - a.eventCount || b.displayOrder - a.displayOrder),
    [filteredCities],
  );

  const groupedCities = useMemo(() => {
    const groups = groupBy(filteredCities, (item) => item.groupKey);
    const keys = Object.keys(groups).sort((a, b) => {
      if (a === "china") return -1;
      if (b === "china") return 1;
      if (a === "other") return 1;
      if (b === "other") return -1;
      return groups[b].length - groups[a].length;
    });
    return keys.map((groupKey) => {
      const items = [...groups[groupKey]].sort(
        (a, b) => b.displayOrder - a.displayOrder || b.eventCount - a.eventCount,
      );
      const first = items[0];
      const label =
        groupKey === "china"
          ? t("city.group.china")
          : groupKey === "special"
            ? t("city.group.special")
            : first?.parentName
              ? first.parentName
              : t("city.group.other");
      return { groupKey, label, items };
    });
  }, [filteredCities, t]);

  const showFlatList = Boolean(trimmedQuery) || sortMode === "count";

  return (
    <div className="space-y-4">
      {/* 热门兽展城市精选卡片 */}
      {featuredCities.length > 0 && (
        <section className="bg-white shadow-sm p-4 sm:p-6 rounded-xl">
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 mb-3.5 sm:mb-4">{t("city.featuredTitle")}</h1>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {featuredCities.map((city) => {
              const coverSrc = getEventCoverImgPath({ thumbnail: city.latestEvent?.thumbnail ?? null });
              return (
                <Link
                  key={city.id}
                  href={`/city/${city.slug}`}
                  onClick={() =>
                    sendTrack({
                      eventName: "click-city-jump-link",
                      eventValue: { value: city.name, from: "city featured" },
                    })
                  }
                  className="group relative h-32 sm:h-40 rounded-xl overflow-hidden bg-gray-200 block"
                >
                  <Image
                    alt={t("city.eventBackgroundAlt", { name: city.name })}
                    src={coverSrc}
                    width={420}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    autoFormat
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

                  <span className="absolute top-2.5 right-2.5 rounded-full bg-black/45 backdrop-blur-sm px-2.5 py-0.5 text-xs font-bold text-white tabular-nums">
                    {t("city.eventCountShort", { count: city.eventCount })}
                  </span>

                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                    <h2 className="text-base sm:text-xl font-bold text-white truncate">{city.name}</h2>
                    {city.latestEvent && (
                      <p className="mt-0.5 text-xs text-white/80 truncate">{city.latestEvent.name}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 全部城市索引 */}
      <section className="bg-white shadow-sm p-4 sm:p-6 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-5">
          <div className="flex items-baseline gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">{t("city.allCitiesTitle")}</h2>
            <span className="text-xs sm:text-sm font-medium text-gray-400 tabular-nums">
              {t("city.group.count", { count: filteredCities.length })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-1.5 flex-1 sm:w-52 sm:flex-initial">
              <IoSearch className="text-gray-400 text-sm shrink-0" aria-hidden />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("city.searchPlaceholder")}
                className="w-full min-w-0 bg-transparent text-xs sm:text-sm text-slate-700 placeholder:text-gray-400 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-gray-400 hover:text-gray-600 shrink-0"
                >
                  <IoClose className="text-sm" />
                </button>
              )}
            </div>

            <div className="inline-flex items-center rounded-xl bg-gray-100 p-1 shrink-0">
              <button
                type="button"
                onClick={() => setSortMode("region")}
                className={clsx(
                  "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                  sortMode === "region" ? "bg-white text-red-400 font-bold shadow-sm" : "text-gray-500",
                )}
              >
                {t("city.sortByRegion")}
              </button>
              <button
                type="button"
                onClick={() => setSortMode("count")}
                className={clsx(
                  "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                  sortMode === "count" ? "bg-white text-red-400 font-bold shadow-sm" : "text-gray-500",
                )}
              >
                {t("city.sortByCount")}
              </button>
            </div>
          </div>
        </div>

        {filteredCities.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">{t("city.noMatch")}</div>
        ) : showFlatList ? (
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
            {sortedByCount.map((city) => (
              <CityTile key={city.id} city={city} />
            ))}
          </ul>
        ) : (
          <div className="space-y-6">
            {groupedCities.map((group) => (
              <div key={group.groupKey}>
                <h3 className="text-sm sm:text-base font-bold text-gray-500 mb-3 flex items-baseline gap-1.5">
                  <span>{group.label}</span>
                  <span className="text-xs font-normal text-gray-400 tabular-nums">({group.items.length})</span>
                </h3>
                <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
                  {group.items.map((city) => (
                    <CityTile key={city.id} city={city} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function CityTile({ city }: { city: CityDirectoryItem }) {
  const { t } = useTranslation();

  return (
    <li>
      <Link
        href={`/city/${city.slug}`}
        onClick={() =>
          sendTrack({
            eventName: "click-city-jump-link",
            eventValue: { value: city.name, from: "city list" },
          })
        }
        className="group flex items-center justify-between gap-2 rounded-xl bg-gray-100/75 hover:bg-gray-100 active:bg-gray-200/70 px-3.5 py-2.5 transition-colors"
      >
        <span className="text-sm sm:text-base font-bold text-slate-700 group-hover:text-red-400 truncate transition-colors">
          {city.name}
        </span>
        <span className="text-xs font-medium tabular-nums text-gray-400 group-hover:text-red-400 shrink-0 transition-colors">
          {t("city.eventCountShort", { count: city.eventCount })}
        </span>
      </Link>
    </li>
  );
}

export async function getServerSideProps({ locale = "zh-Hans", res }: GetServerSidePropsContext) {
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=300");

  const [regions, layoutProps] = await Promise.all([
    RegionAPI.getRegionList({
      current: 1,
      pageSize: 500,
      withEvents: true,
    }),
    getLayoutProps(locale),
  ]);

  const validRegions = regions.records.filter((item) => item.kind !== RegionType.COUNTRY && item.eventCount > 0);
  const topIds = new Set(
    [...validRegions]
      .sort((a, b) => b.eventCount - a.eventCount || b.displayOrder - a.displayOrder)
      .slice(0, FEATURED_CITY_LIMIT)
      .map((item) => item.id),
  );

  const cities: CityDirectoryItem[] = validRegions.map((item) => {
    const groupKey = ["xianggang", "aomen"].includes(item.slug) ? "special" : (item.parent?.slug ?? "other");
    const firstEvent = topIds.has(item.id) ? item.event?.[0] : undefined;
    return {
      id: item.id,
      slug: item.slug,
      name: item.name,
      eventCount: item.eventCount,
      displayOrder: item.displayOrder,
      groupKey,
      parentName: item.parent?.name ?? null,
      latestEvent: firstEvent
        ? {
            name: firstEvent.name,
            thumbnail: firstEvent.thumbnail ?? null,
          }
        : null,
    };
  });

  return {
    props: {
      cities,
      headMetas: {
        title: CityPageMeta[locale as currentSupportLocale].title,
        des: CityPageMeta[locale as currentSupportLocale].description(cities.length),
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
