import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import "dayjs/locale/zh-tw";
import { groupBy } from "es-toolkit";
import type { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useTranslation } from "next-i18next/pages";
import { IoArrowForward, IoChevronForward } from "react-icons/io5";
import * as z from "zod/v4";

import { RegionAPI } from "@/api/region";
import Image from "@/components/Image";
import Pagination from "@/components/Pagination";
import type { ListResponse } from "@/types/api";
import { getEventOrganizations } from "@/utils/event";
import { getEventCoverImgPath } from "@/utils/imageLoader";
import { getLayoutProps } from "@/utils/layoutProps";
import { currentSupportLocale, getDayjsLocale, monthNumberFormatter } from "@/utils/locale";
import { cityDetailDescriptionGenerator, cityDetailKeywordGenerator, CityPageMeta } from "@/utils/meta";
import { breadcrumbGenerator } from "@/utils/structuredData";
import { sendTrack } from "@/utils/track";
import { getEventDetailUrl } from "@/utils/url";

type CitySummary = {
  slug: string;
  name: string;
  eventCount: number;
};

type CityEventItem = {
  id: string;
  urlKey: string;
  name: string;
  startAt: string | null;
  endAt: string | null;
  thumbnail: string | null;
  organization: { name: string; slug: string } | null;
};

export default function CityDetail({ region, events }: { region: CitySummary; events: ListResponse<CityEventItem> }) {
  const { t, i18n } = useTranslation();

  const groupEventsByYear = groupBy(events.records, (event) =>
    event.startAt ? String(dayjs(event.startAt).year()) : "no-date",
  );

  const yearMonthData = Object.entries(groupEventsByYear).reduce(
    (acc, [year, yearEvents]) => {
      if (year === "no-date") {
        acc[year] = { "no-date": yearEvents };
      } else {
        const monthGroups = groupBy(yearEvents, (event) =>
          event.startAt ? dayjs(event.startAt).format("M") : "no-date",
        );
        Object.keys(monthGroups).forEach((month) => {
          monthGroups[month].sort((a, b) => {
            if (!a.startAt && !b.startAt) return 0;
            if (!a.startAt) return 1;
            if (!b.startAt) return -1;
            return new Date(b.startAt).getTime() - new Date(a.startAt).getTime();
          });
        });
        acc[year] = monthGroups;
      }
      return acc;
    },
    {} as Record<string, Record<string, CityEventItem[]>>,
  );

  const yearList = Object.keys(yearMonthData).sort((a, b) => {
    if (a === "no-date") return 1;
    if (b === "no-date") return -1;
    return parseInt(b, 10) - parseInt(a, 10);
  });

  const getMonthName = (month: string) => {
    if (month === "no-date") return t("years.unknown");
    return t("homepage.month", {
      month: monthNumberFormatter(month, i18n.language),
    });
  };

  return (
    <div className="space-y-4">
      {/* 城市头部信息卡 */}
      <div className="bg-white shadow-sm p-4 sm:p-6 rounded-xl">
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-400 mb-2">
          <Link href="/city" className="hover:text-red-400 transition-colors">
            {t("header.nav.city")}
          </Link>
          <IoChevronForward className="text-xs shrink-0" aria-hidden />
          <span className="text-gray-600 font-medium">{region.name}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap items-baseline gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{region.name}</h1>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs sm:text-sm font-medium text-gray-600 tabular-nums">
              {t("city.totalEvents", { count: events.total })}
            </span>
          </div>

          <Link
            href={{ pathname: "/", query: { region: region.slug, includePastEvents: "true" } }}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gray-100 hover:bg-red-400 hover:text-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 transition-colors self-start sm:self-auto"
          >
            <span>{t("city.filterOnHome")}</span>
            <IoArrowForward className="text-sm shrink-0" aria-hidden />
          </Link>
        </div>
      </div>

      {/* 按年/月倒序展示活动 */}
      <div className="bg-white shadow-sm p-4 sm:p-6 rounded-xl">
        <div className="space-y-7 sm:space-y-8">
          {yearList.map((year) => {
            const sortedMonths = Object.keys(yearMonthData[year]).sort((a, b) => {
              if (a === "no-date") return 1;
              if (b === "no-date") return -1;
              return parseInt(b, 10) - parseInt(a, 10);
            });

            return (
              <section key={year} className="space-y-4">
                <h2 className="text-lg sm:text-xl font-bold text-red-400 border-b border-gray-100 pb-2">
                  {year === "no-date" ? t("years.unknown") : t("years.known", { year })}
                </h2>

                {sortedMonths.map((month) => (
                  <div key={`${year}-${month}`}>
                    <h3 className="text-sm sm:text-base font-bold text-gray-500 mb-2.5">{getMonthName(month)}</h3>
                    <MonthSection events={yearMonthData[year][month]} />
                  </div>
                ))}
              </section>
            );
          })}
        </div>

        <Pagination
          className="mt-6 sm:mt-8"
          current={events.current}
          totalPages={Math.ceil(events.total / events.pageSize)}
          getPageHref={(page) => ({
            pathname: `/city/${region.slug}`,
            query: page > 1 ? { page } : {},
          })}
        />
      </div>
    </div>
  );
}

function MonthSection({ events }: { events: CityEventItem[] }) {
  const { t, i18n } = useTranslation();
  const dateFormat = t("date.monthDay") || "MM月DD日";
  const dayjsLocale = getDayjsLocale(i18n.language);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {events.map((event) => (
        <Link
          key={event.id}
          href={getEventDetailUrl({ urlKey: event.urlKey })}
          onClick={() =>
            sendTrack({
              eventName: "click-mini-event-card",
              eventValue: {
                href: getEventDetailUrl({ urlKey: event.urlKey }),
                from: "city list",
              },
            })
          }
          className="group relative h-36 sm:h-40 rounded-xl overflow-hidden bg-gray-200 block shadow-sm"
        >
          <Image
            alt={t("city.eventBackgroundAlt", { name: event.name })}
            src={getEventCoverImgPath(event)}
            width={420}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            autoFormat
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

          <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4">
            {event.organization?.name && (
              <div className="text-xs font-medium text-white/80 truncate">{event.organization.name}</div>
            )}
            <h4 className="mt-0.5 text-base sm:text-lg font-bold text-white line-clamp-2 leading-snug">{event.name}</h4>
            {event.startAt && (
              <p className="mt-1 text-xs text-white/85 tabular-nums">
                {dayjs(event.startAt).locale(dayjsLocale).format(dateFormat)}
                {event.endAt && !dayjs(event.startAt).isSame(dayjs(event.endAt), "day")
                  ? ` - ${dayjs(event.endAt).locale(dayjsLocale).format(dateFormat)}`
                  : ""}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { locale = "zh-Hans", params, query, res } = context;
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=300");

  const regionCodeResult = z
    .string()
    .min(1)
    .regex(/^[a-zA-Z0-9-]+$/)
    .safeParse(params?.code);

  if (!regionCodeResult.success) {
    return { notFound: true };
  }
  const regionCode = regionCodeResult.data;

  const pageResult = z.coerce
    .number()
    .int()
    .min(1)
    .max(Number.MAX_SAFE_INTEGER)
    .safeParse(query.page ?? 1);
  if (!pageResult.success || Array.isArray(query.page)) {
    return { notFound: true };
  }
  const current = pageResult.data;

  try {
    const [region, regionEvents, layoutProps] = await Promise.all([
      RegionAPI.getRegionDetail(regionCode),
      RegionAPI.getRegionEvents(regionCode, {
        current,
        pageSize: 24,
        orderByStartAt: "desc",
      }),
      getLayoutProps(locale),
    ]);

    if (!region || current > Math.max(1, Math.ceil(regionEvents.total / regionEvents.pageSize))) {
      return {
        notFound: true,
      };
    }

    const parsedEvents: CityEventItem[] = regionEvents.records.map((event) => {
      const { primary } = getEventOrganizations(event);
      return {
        id: event.id,
        urlKey: event.urlKey,
        name: event.name,
        startAt: event.startAt,
        endAt: event.endAt,
        thumbnail: event.thumbnail ?? null,
        organization: primary ? { slug: primary.slug, name: primary.name } : null,
      };
    });

    return {
      props: {
        headMetas: {
          title: `${region.name} - ${CityPageMeta[locale as currentSupportLocale].title}`,
          des: cityDetailDescriptionGenerator(locale as currentSupportLocale, region.name, regionEvents.total),
          keywords: cityDetailKeywordGenerator(locale as currentSupportLocale, { name: region.name }),
          url: `/city/${regionCode}`,
        },
        structuredData: {
          ...breadcrumbGenerator({
            items: [
              {
                name: CityPageMeta[locale as currentSupportLocale].title,
                item: "/city",
              },
              {
                name: region.name,
                item: `/city/${regionCode}`,
              },
            ],
          }),
        },
        region: {
          slug: region.slug,
          name: region.name,
          eventCount: region.eventCount,
        },
        events: { ...regionEvents, records: parsedEvents },
        ...layoutProps,
      },
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return { notFound: true };
    }
    throw error;
  }
}
