import type { GetServerSidePropsContext } from "next";

import { EventsAPI } from "@/api/events";
import type { SimpleEventItem } from "@/types/event";
import { getEventOrganizations } from "@/utils/event";
import { getLayoutProps } from "@/utils/layoutProps";
import { currentSupportLocale } from "@/utils/locale";
import { YearPageMeta } from "@/utils/meta";
import { breadcrumbGenerator } from "@/utils/structuredData";

export async function getYearsPageProps({
  locale = "zh-Hans",
  res,
  requestedYear,
}: {
  locale?: string;
  res: GetServerSidePropsContext["res"];
  requestedYear?: string;
}) {
  const [yearStats, layoutProps] = await Promise.all([EventsAPI.getEventYears(), getLayoutProps(locale)]);

  const currentCalendarYear = new Date().getFullYear();
  const hasCurrentYear = yearStats.years.some((item) => item.year === currentCalendarYear);
  const latestNumberYear = yearStats.years.find((item) => item.year !== null)?.year ?? null;
  const defaultYear: number | "unknown" = hasCurrentYear ? currentCalendarYear : (latestNumberYear ?? "unknown");

  let selectedYear: number | "unknown" = defaultYear;
  if (requestedYear !== undefined) {
    if (requestedYear === "unknown") {
      if (!yearStats.years.some((item) => item.year === null)) {
        return { notFound: true as const };
      }
      selectedYear = "unknown";
    } else if (/^\d{4}$/.test(requestedYear)) {
      const parsed = Number(requestedYear);
      if (!yearStats.years.some((item) => item.year === parsed)) {
        return { notFound: true as const };
      }
      selectedYear = parsed;
    } else {
      return { notFound: true as const };
    }
  }

  const isHistoricalYear = typeof selectedYear === "number" && selectedYear < currentCalendarYear;
  res.setHeader(
    "Cache-Control",
    isHistoricalYear
      ? "public, s-maxage=3600, stale-while-revalidate=86400"
      : "public, s-maxage=300, stale-while-revalidate=300",
  );

  const eventData =
    yearStats.years.length > 0
      ? await EventsAPI.getEventList({
          current: "1",
          pageSize: "500",
          eventYear: selectedYear,
          orderByStartAt: "asc",
        })
      : { records: [], total: 0 };

  const slimEvents: SimpleEventItem[] = eventData.records.map((event) => {
    const { primary } = getEventOrganizations(event);
    return {
      id: event.id,
      urlKey: event.urlKey,
      name: event.name,
      startAt: event.startAt,
      endAt: event.endAt,
      scale: event.scale,
      region: event.region ? { localName: event.region.localName } : null,
      organization: primary ? { slug: primary.slug, name: primary.name } : null,
    };
  });

  const citiesCovered = new Set(eventData.records.map((event) => event.region?.id).filter(Boolean)).size;

  const totalYears = yearStats.years.filter((item) => item.year !== null).length;
  const baseTitle = YearPageMeta[locale as currentSupportLocale].title;
  const pageUrl = requestedYear ? `/years/${requestedYear}` : "/years";
  const pageTitle = requestedYear ? `${requestedYear} - ${baseTitle}` : baseTitle;

  const breadcrumbItems = requestedYear
    ? [
        { name: baseTitle, item: "/years" },
        { name: requestedYear, item: pageUrl },
      ]
    : [{ name: baseTitle, item: "/years" }];

  return {
    props: {
      selectedYear,
      defaultYear,
      totalAmount: yearStats.total,
      citiesCovered,
      years: yearStats.years,
      events: slimEvents,
      headMetas: {
        title: pageTitle,
        des: YearPageMeta[locale as currentSupportLocale].description(totalYears, yearStats.total),
        url: pageUrl,
      },
      structuredData: {
        ...breadcrumbGenerator({ items: breadcrumbItems }),
      },
      ...layoutProps,
    },
  };
}
