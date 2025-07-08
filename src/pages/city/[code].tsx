import { getEventList } from "@/api/events";
import { getRegionDetail, getRegionList } from "@/api/region";
import { EventType } from "@/types/event";
import { Region } from "@/types/region";
import { sendTrack } from "@/utils/track";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import z from "zod";
import Image from "@/components/image";
import { getEventCoverImgPath } from "@/utils/imageLoader";
import { format } from "date-fns";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { groupBy } from "es-toolkit";
import { useTranslation } from "next-i18next";
import { monthNumberFormatter } from "@/utils/locale";

export default function CityDetail({
  region,
  events,
}: {
  region: Region;
  events: EventType[];
}) {
  const { t, i18n } = useTranslation();
  // 按年份分组
  const groupEventsByYear = groupBy(events, (event) => {
    const year = event.startAt ? format(event.startAt, "yyyy") : "no-date";
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
          return event.startAt ? format(event.startAt, "M") : "no-date";
        });

        // 对每个月份内的事件按开始日期排序
        Object.keys(monthGroups).forEach((month) => {
          monthGroups[month].sort((a, b) => {
            if (!a.startAt && !b.startAt) return 0;
            if (!a.startAt) return 1;
            if (!b.startAt) return -1;
            return (
              new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
            );
          });
        });

        acc[year] = monthGroups;
      }
      return acc;
    },
    {} as Record<string, Record<string, EventType[]>>
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
      <div className="bg-white border p-6 rounded-xl">
        <h2 className="text-2xl font-bold text-gray-600">{region.name}</h2>
      </div>

      <div className="bg-white border p-6 rounded-xl mt-6">
        <h2 className="text-2xl font-bold text-gray-600"></h2>
        <div className="grid grid-cols-1 gap-8 mt-4">
          {yearList.map((year) => (
            <div key={year} className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-700 border-b pb-2">
                {year === "no-date"
                  ? t("years.unknown")
                  : t("years.known", {
                      year: year,
                    })}
              </h3>

              {Object.entries(yearMonthData[year]).map(
                ([month, monthEvents]) => (
                  <div key={`${year}-${month}`}>
                    <h4 className="text-lg font-medium text-gray-600 mb-3">
                      {getMonthName(month)}
                    </h4>
                    <MonthSection events={monthEvents} />
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function MonthSection({ events }: { events: EventType[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
      {events.map((event) => (
        <Link
          key={event.id}
          href={`/${event.organization?.slug}/${event.slug}`}
          onClick={() =>
            sendTrack({
              eventName: "click-mini-event-card",
              eventValue: {
                href: `/${event.organization?.slug}/${event.slug}`,
                from: "city list",
              },
            })
          }
          className="rounded-xl shadow-xl h-36 relative flex justify-center items-center group"
        >
          <div className="rounded-xl duration-500 transition group-hover:border-gray-400 w-full h-full absolute brightness-75 hover:brightness-100">
            <Image
              alt="活动背景"
              src={getEventCoverImgPath(event)}
              width={350}
              className="h-full w-full object-cover rounded-xl overflow-hidden"
              autoFormat
            />
          </div>
          <div className="z-10 relative pointer-events-none">
            <h4 className="tracking-wide text-white font-bold text-lg text-center">{`${event.organization?.name} · ${event.name}`}</h4>
            {event.startAt && event.endAt && (
              <p className="text-center text-white">
                {event.startAt && (
                  <span>{format(event.startAt, "MM月dd日")}</span>
                )}
                -{event.endAt && <span>{format(event.endAt, "MM月dd日")}</span>}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { locale = "zh-Hans", params } = context;

  const regionCode = z
    .string()
    .min(1)
    .regex(/^[a-zA-Z0-9-]+$/)
    .parse(params?.code);

  const [region, regionEvents] = await Promise.all([
    getRegionDetail(regionCode),
    getEventList({
      eventRegionCode: [regionCode],
      current: "1",
      pageSize: "50",
    }),
  ]);

  const pickEventSchema = z.array(
    z.object({
      id: z.string(),
      slug: z.string(),
      thumbnail: z.string().optional(),
      organization: z.object({
        name: z.string(),
        slug: z.string(),
      }),
      name: z.string(),
      startAt: z.string(),
      endAt: z.string(),
    })
  );

  return {
    props: {
      region: region,
      events: pickEventSchema.parse(regionEvents?.records),
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
