import { useMemo } from "react";
import { groupBy } from "es-toolkit/compat";
import { createLoader, parseAsArrayOf, parseAsBoolean, parseAsString, useQueryStates } from "nuqs";
import { useTranslation } from "next-i18next/pages";
import { getLayoutProps } from "@/utils/layoutProps";
import type { GetServerSidePropsContext } from "next";
import { EventsAPI } from "@/api/events";
import { RegionAPI } from "@/api/region";
import EventCard from "@/components/EventCard";
import EventFilterBar, {
  EMPTY_FILTERS,
  type FilterFeatureOption,
  type FilterRegionOption,
  type HomeFilterState,
} from "@/components/EventFilterBar";
import { FriendSiteBlock } from "@/components/Layout/footer";
import { EventLocationType, EventScale, EventStatus, EventTypeMap } from "@/constants/event";
import { RegionType } from "@/constants/region";
import { getEventOrganizations, groupByCustomDurationEvent, sortEvents } from "@/utils/event";

import { DurationType } from "@/types/list";
import type { EventCardItem } from "@/types/event";
import { formatLocale, monthNumberFormatter } from "@/utils/locale";
import { keywordGenerator } from "@/utils/meta";
import dayjs from "dayjs";

const VALID_SCALES = new Set<string>(Object.values(EventScale));
const VALID_TYPES = new Set<string>(Object.values(EventTypeMap));
const VALID_LOCATION_TYPES = new Set<string>(Object.values(EventLocationType));
const REGION_SLUG_REGEX = /^[a-zA-Z0-9-]+$/;

export const searchParams = {
  q: parseAsString.withDefault(""),
  includePastEvents: parseAsBoolean.withDefault(false),
  region: parseAsArrayOf(parseAsString).withDefault([]),
  scale: parseAsArrayOf(parseAsString).withDefault([]),
  type: parseAsArrayOf(parseAsString).withDefault([]),
  locationType: parseAsArrayOf(parseAsString).withDefault([]),
  feature: parseAsArrayOf(parseAsString).withDefault([]),
};

export const loadSearchParams = createLoader(searchParams);

export default function Home(props: {
  events: EventCardItem[];
  regions: FilterRegionOption[];
  features: FilterFeatureOption[];
  nowTimestamp: number;
}) {
  const { t } = useTranslation();
  const [filters, setFilters] = useQueryStates(searchParams, {
    shallow: false,
    history: "push",
  });

  const filteredEvents = useMemo(() => {
    if (filters.includePastEvents) {
      return props.events;
    }
    return props.events.filter((event) => {
      const endTime = event.endAt ? new Date(new Date(event.endAt).setHours(23, 59, 59, 999)).getTime() : null;
      return !endTime || props.nowTimestamp <= endTime;
    });
  }, [props.events, filters.includePastEvents, props.nowTimestamp]);

  const groupByCustomDurationEvents = useMemo(
    () => groupByCustomDurationEvent(filteredEvents, props.nowTimestamp),
    [filteredEvents, props.nowTimestamp],
  );
  const currentYear = new Date(props.nowTimestamp).getFullYear();

  const hasFilterCriteria = (state: HomeFilterState) =>
    Boolean(
      state.q ||
      state.region.length ||
      state.scale.length ||
      state.type.length ||
      state.locationType.length ||
      state.feature.length,
    );

  const hasActiveSearchOrFilter = hasFilterCriteria(filters) || filters.includePastEvents;

  const handleFilterChange = (next: HomeFilterState) => {
    const prevHadCriteria = hasFilterCriteria(filters);
    const nextHasCriteria = hasFilterCriteria(next);
    const toggledOnlySwitch =
      next.includePastEvents !== filters.includePastEvents && prevHadCriteria === nextHasCriteria;

    let includePastEvents = next.includePastEvents;
    if (!toggledOnlySwitch) {
      if (!prevHadCriteria && nextHasCriteria) {
        includePastEvents = true;
      } else if (prevHadCriteria && !nextHasCriteria) {
        includePastEvents = false;
      }
    }

    void setFilters({
      q: next.q || null,
      includePastEvents: includePastEvents ? true : null,
      region: next.region.length ? next.region : null,
      scale: next.scale.length ? next.scale : null,
      type: next.type.length ? next.type : null,
      locationType: next.locationType.length ? next.locationType : null,
      feature: next.feature.length ? next.feature : null,
    });
  };

  return (
    <>
      <div>
        <EventFilterBar
          filters={filters}
          regions={props.regions}
          features={props.features}
          onChange={handleFilterChange}
        />

        {filteredEvents.length === 0 && (
          <div className="bg-white shadow-sm rounded-xl p-6 mt-4 text-center min-h-[260px] flex justify-center items-center flex-col">
            <h1 className="text-lg sm:text-xl text-red-400 font-bold">
              {t("homepage.noResult")}
              <br />
              {t("homepage.noResultTip")}
            </h1>
            <p className="text-sm sm:text-base text-gray-400 mt-2">{t("homepage.noResultContact")}</p>
            {hasActiveSearchOrFilter && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {!filters.includePastEvents && (
                  <button
                    type="button"
                    onClick={() => handleFilterChange({ ...filters, includePastEvents: true })}
                    className="px-4 py-2 rounded-xl bg-red-400 text-white text-sm font-bold active:bg-red-500 transition-colors"
                  >
                    {t("event.filter.searchWithPast")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleFilterChange(EMPTY_FILTERS)}
                  className="px-4 py-2 rounded-xl bg-[#f5f5f7] text-gray-600 text-sm font-medium active:bg-gray-200 transition-colors"
                >
                  {t("event.filter.clearAll")}
                </button>
              </div>
            )}
          </div>
        )}

        {Object.keys(groupByCustomDurationEvents)
          .filter((type) => groupByCustomDurationEvents[type as DurationType].length > 0)
          .map((type, sectionIndex) => (
            <DurationSection
              key={type}
              durationType={type}
              events={groupByCustomDurationEvents[type as DurationType]}
              currentYear={currentYear}
              prioritizeFirstCards={sectionIndex === 0}
            />
          ))}

        <FriendSiteBlock />
      </div>
    </>
  );
}

function DurationSection({
  durationType,
  events,
  currentYear,
  prioritizeFirstCards,
}: {
  durationType: string;
  events: EventCardItem[];
  currentYear: number;
  prioritizeFirstCards?: boolean;
}) {
  const { t, i18n } = useTranslation();

  const groupByMonthEvent = useMemo(() => {
    return groupBy(events, (event) =>
    // Some event open in the last day of start month, but it should be count in next month.
    {
      const endDate = event.endAt ? new Date(event.endAt) : null;
      if (!endDate) {
        return "unknown";
      }
      return `${endDate.getFullYear()}-${endDate.getMonth() + 1}`;
    });
  }, [events]);

  const sortedMonths = useMemo(() => {
    const sortedResult = Object.keys(groupByMonthEvent).sort((a, b) => {
      const yearA = parseInt(a.split("-")[0]);
      const yearB = parseInt(b.split("-")[0]);
      if (yearA !== yearB) {
        return yearA - yearB;
      }
      return parseInt(a.split("-")[1]) - parseInt(b.split("-")[1]);
    });
    return durationType === DurationType.Passed ? sortedResult.reverse() : sortedResult;
  }, [groupByMonthEvent, durationType]);

  if (durationType === DurationType.Now) {
    return (
      <div className="rounded-xl bg-gray-100/80 p-2.5 sm:p-4 md:p-2 my-3 md:my-4">
        <h3 className="text-lg md:text-xl text-red-400 font-bold mb-2.5 md:mb-6 px-0.5">
          {t("homepage.group.status.now")}
          <span className="text-sm text-gray-500 font-bold ml-1.5">
            {t("homepage.total", { total: events.length })}
          </span>
        </h3>
        <div className="grid gap-3 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortEvents(events, "asc").map((event, index) => (
            <EventCard
              key={event.id}
              event={event}
              sizes="(max-width: 750px) 650px, (max-width: 1080px) 552px, 552px"
              fallbackWidth={650}
              priority={prioritizeFirstCards && index < 4}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {sortedMonths.map((month, monthIndex) => (
        <div key={month} className="rounded-xl bg-gray-100/80 p-2.5 sm:p-4 md:p-2 my-3 md:my-4">
          <h3 className="text-lg md:text-xl text-red-400 font-bold mb-2.5 md:mb-6 px-0.5">
            {month !== "unknown"
              ? parseInt(month.split("-")[0]) === currentYear
                ? t("homepage.month", {
                    month: monthNumberFormatter(month.split("-")[1], i18n.language),
                  })
                : t("homepage.monthWithYear", {
                    year: parseInt(month.split("-")[0]),
                    month: monthNumberFormatter(month.split("-")[1], i18n.language),
                  })
              : null}
            <span className="text-sm text-gray-500 font-bold ml-1.5">
              {t("homepage.total", { total: groupByMonthEvent[month].length })}
            </span>
          </h3>
          <div className="grid gap-3 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortEvents(groupByMonthEvent[month], "asc").map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                sizes="(max-width: 750px) 650px, (max-width: 1080px) 552px, 552px"
                fallbackWidth={650}
                priority={prioritizeFirstCards && monthIndex === 0 && index < 4}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

export async function getServerSideProps({ locale = "zh-Hans", query, res }: GetServerSidePropsContext) {
  const parsed = loadSearchParams(query);
  const keyword = parsed.q.trim().slice(0, 128);
  const regionSlug = parsed.region.filter((slug) => REGION_SLUG_REGEX.test(slug));
  const eventScale = parsed.scale.filter((value) => VALID_SCALES.has(value));
  const eventType = parsed.type.filter((value) => VALID_TYPES.has(value));
  const eventLocationType = parsed.locationType.filter((value) => VALID_LOCATION_TYPES.has(value));
  const eventFeature = parsed.feature.map((item) => item.trim()).filter(Boolean);

  const hasActiveQuery = Boolean(
    keyword ||
    regionSlug.length ||
    eventScale.length ||
    eventType.length ||
    eventLocationType.length ||
    eventFeature.length,
  );

  res.setHeader(
    "Cache-Control",
    hasActiveQuery
      ? "public, s-maxage=60, stale-while-revalidate=60"
      : "public, s-maxage=300, stale-while-revalidate=300",
  );

  const nowTimestamp = Date.now();
  const eventStartAt = hasActiveQuery
    ? undefined
    : parsed.includePastEvents
      ? dayjs(nowTimestamp).startOf("year").toISOString()
      : dayjs(nowTimestamp).subtract(1, "month").startOf("month").toISOString();

  const [events, regionList, featureList, layoutProps] = await Promise.all([
    EventsAPI.getEventList({
      current: "1",
      pageSize: "999",
      keyword: keyword || undefined,
      eventStartAt,
      eventStatus: [EventStatus.EventScheduled, EventStatus.EventRescheduled, EventStatus.EventMovedOnline],
      regionSlug: regionSlug.length ? regionSlug : undefined,
      eventScale: eventScale.length ? eventScale : undefined,
      eventType: eventType.length ? eventType : undefined,
      eventLocationType: eventLocationType.length ? eventLocationType : undefined,
      eventFeature: eventFeature.length ? eventFeature : undefined,
    }),
    RegionAPI.getRegionList({
      current: 1,
      pageSize: 500,
      withEvents: false,
    }),
    EventsAPI.getFeatureList().catch((error) => {
      console.error("[home] failed to load event features", error);
      return null;
    }),
    getLayoutProps(locale),
  ]);

  const parentRegionIds = new Set(regionList.records.map((item) => item.parentId).filter(Boolean));
  const regions: FilterRegionOption[] = regionList.records
    .filter((item) => item.eventCount > 0 && !(item.kind === RegionType.COUNTRY && parentRegionIds.has(item.id)))
    .map((item) => ({
      id: item.id,
      slug: item.slug,
      name: item.name,
      localName: item.localName ?? null,
      parentId: item.parentId ?? null,
      displayOrder: item.displayOrder,
      eventCount: item.eventCount,
    }));

  const seenFeatureNames = new Set<string>();
  const features: FilterFeatureOption[] = [];
  for (const item of featureList?.records ?? []) {
    if (seenFeatureNames.has(item.name)) continue;
    seenFeatureNames.add(item.name);
    features.push({ name: item.name, category: item.category ?? null });
  }

  return {
    props: {
      nowTimestamp,
      regions,
      features,
      events: events.records.map((event) => {
        const { primary, others } = getEventOrganizations(event);
        return {
          id: event.id,
          urlKey: event.urlKey,
          name: event.name,
          startAt: event.startAt,
          endAt: event.endAt,
          scale: event.scale,
          type: event.type,
          locationType: event.locationType,
          placeName: event.place?.name ?? null,
          region: event.region ? { localName: event.region.localName ?? null } : null,
          organization: primary ? { slug: primary.slug, name: primary.name } : null,
          organizations: others.map((organization) => ({
            slug: organization.slug,
            name: organization.name,
          })),
          features: event.features.map((feature) => ({ name: feature.name })),
          thumbnail: event.thumbnail,
          media: event.media?.images ? { images: event.media.images.map((image) => ({ url: image.url })) } : null,
        };
      }),
      headMetas: {
        keywords: keywordGenerator({
          page: "home",
          locale: formatLocale(locale),
        }),
      },
      ...layoutProps,
    },
  };
}
