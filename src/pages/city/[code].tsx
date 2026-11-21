import { RegionAPI } from "@/api/region";
import Pagination from "@/components/Pagination";
import type { ListResponse } from "@/types/api";
import type { RegionListItem } from "@/types/region";
import { getEventOrganizations } from "@/utils/event";
import { sendTrack } from "@/utils/track";
import { getEventDetailUrl } from "@/utils/url";
import axios from "axios";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import * as z from "zod/v4";
import Image from "@/components/Image";
import { getEventCoverImgPath } from "@/utils/imageLoader";
import "dayjs/locale/zh-cn";
import "dayjs/locale/zh-tw";
import { getLayoutProps } from "@/utils/layoutProps";
import { groupBy } from "es-toolkit";
import { useTranslation } from "next-i18next/pages";
import { currentSupportLocale, getDayjsLocale, monthNumberFormatter } from "@/utils/locale";
import dayjs from "dayjs";
import { breadcrumbGenerator } from "@/utils/structuredData";
import { cityDetailDescriptionGenerator, cityDetailKeywordGenerator, CityPageMeta } from "@/utils/meta";

type CityEventItem = {
  id: string;
  urlKey: string;
  name: string;
  startAt: string | null;
  endAt: string | null;
  thumbnail: string | null;
  organization: { name: string; slug: string } | null;
};

export default function CityDetail({
  region,
  events,
}: {
  region: RegionListItem;
  events: ListResponse<CityEventItem>;
}) {
  const { t, i18n } = useTranslation();
  // 按年份分组
  const groupEventsByYear = groupBy(events.records, (event) => {
    const year = event.startAt ? dayjs(event.startAt).year() : "no-date";
    return year;
  });

  // 对每个年份内的事件按月份分组
  const yearMonthData = Object.entries(groupEventsByYear).reduce(
    (acc, [year, yearEvents]) => {
      if (year === "no-date") {
        acc[year] = { "no-date": yearEvents };
      } else {
        // 按月份分组
        const monthGroups = groupBy(yearEvents, (event) => {
          return event.startAt ? dayjs(event.startAt).format("M") : "no-date";
        });

        // 对每个月份内的事件按开始日期排序
        Object.keys(monthGroups).forEach((month) => {
          monthGroups[month].sort((a, b) => {
            if (!a.startAt && !b.startAt) return 0;
            if (!a.startAt) return 1;
            if (!b.startAt) return -1;
            return new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
          });
        });

        acc[year] = monthGroups;
      }
      return acc;
    },
    {} as Record<string, Record<string, CityEventItem[]>>,
  );

  // 排序年份（最新的在前）
  const yearList = Object.keys(yearMonthData).sort((a, b) => {
    if (a === "no-date") return 1;
    if (b === "no-date") return -1;
    return parseInt(b) - parseInt(a);
  });

  // 月份名称映射
  const getMonthName = (month: string) => {
    if (month === "no-date") return t("years.unknown");
    return t("homepage.month", {
      month: monthNumberFormatter(month, i18n.language),
    });
  };

  return (
    <>
      <div className="bg-white shadow-sm p-4 sm:p-6 rounded-xl">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-600">{region.name}</h1>
      </div>

      <div className="bg-white shadow-sm p-4 sm:p-6 rounded-xl mt-3 sm:mt-6">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 mt-1 sm:mt-4">
          {yearList.map((year) => (
            <div key={year} className="space-y-3 sm:space-y-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 border-b pb-2">
                {year === "no-date"
                  ? t("years.unknown")
                  : t("years.known", {
                      year: year,
                    })}
              </h3>

              {Object.entries(yearMonthData[year]).map(([month, monthEvents]) => (
                <div key={`${year}-${month}`}>
                  <h4 className="text-base sm:text-lg font-medium text-gray-600 mb-2 sm:mb-3">{getMonthName(month)}</h4>
                  <MonthSection events={monthEvents} />
                </div>
              ))}
            </div>
          ))}
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
    </>
  );
}

function MonthSection({ events }: { events: CityEventItem[] }) {
  const { t, i18n } = useTranslation();
  const dateFormat = t("date.monthDay") || "MM月DD日";
  const dayjsLocale = getDayjsLocale(i18n.language);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mt-2.5 sm:mt-4">
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
          className="rounded-xl shadow-md sm:shadow-xl h-32 sm:h-36 relative flex justify-center items-center group overflow-hidden"
        >
          <div className="rounded-xl duration-500 transition group-hover:border-gray-400 w-full h-full absolute brightness-75 group-hover:brightness-95">
            <Image
              alt={t("city.eventBackgroundAlt", { name: event.name })}
              src={getEventCoverImgPath(event)}
              width={350}
              className="h-full w-full object-cover rounded-xl overflow-hidden"
              autoFormat
            />
          </div>
          <div className="z-10 relative pointer-events-none px-4 py-2 text-center">
            <h4 className="tracking-wide text-white font-bold text-base sm:text-lg text-center drop-shadow-sm line-clamp-2">{`${event.organization?.name} · ${event.name}`}</h4>
            {event.startAt && event.endAt && (
              <p className="text-center text-white/95 text-xs sm:text-sm mt-1 drop-shadow-sm">
                {event.startAt && <span>{dayjs(event.startAt).locale(dayjsLocale).format(dateFormat)}</span>}-
                {event.endAt && <span>{dayjs(event.endAt).locale(dayjsLocale).format(dateFormat)}</span>}
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
        region: region,
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
