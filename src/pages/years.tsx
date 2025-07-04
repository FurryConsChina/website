import { eventGroupByMonth, eventGroupByYear } from "@/utils/event";
import SimpleEventCard from "@/components/SimpleEventCard";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { eventsAPI } from "@/api/events";
import { EventType } from "@/types/event";
import { monthNumberFormatter } from "@/utils/locale";
import { currentSupportLocale, YearPageMeta } from "@/utils/meta";

export default function Years({ events }: { events: EventType[] }) {
  const groupByYearEvents = eventGroupByYear(events, "asc");

  const { t, i18n } = useTranslation();

  const years = groupByYearEvents.map((group) => group.year);

  return (
    <div>
      <div className="mb-4 border rounded-xl p-6 bg-white">
        <h2 className="font-bold text-red-400 text-2xl mb-4">总结</h2>
        <div className="text-gray-600">
          {t("years.des", {
            totalYear: years.filter((year) => year !== "no-date").length,
            totalAmount: events.length,
          })}
          <br />
          <div className="flex flex-wrap gap-x-4 gap-y-4 mt-2">
            {groupByYearEvents.map((group) => (
              <a
                key={group.year}
                href={`#${group.year}`}
                className="text-center border rounded-full flex items-center cursor-pointer group overflow-hidden"
              >
                <span className="font-bold text-red-400 bg-slate-100 px-2 py-1 group-hover:bg-red-400 group-hover:text-white rounded-l transition-all duration-300">
                  {t("years.known", { year: group.year })}
                </span>
                <span className=" text-slate-500 font-medium px-4 py-1">
                  {group.events.length}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {groupByYearEvents.map((yearGroup) => (
        <section
          key={yearGroup.year}
          className="mb-4 border rounded-xl p-6 bg-white"
          id={yearGroup.year}
        >
          <h2 className="font-bold text-red-400 text-2xl mb-4">
            {yearGroup.year === "no-date"
              ? t("years.unknown")
              : t("years.known", { year: yearGroup.year })}
          </h2>
          <p className="text-gray-600 mb-4">
            {t("years.total", { total: yearGroup.events.length })}：
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {eventGroupByMonth(yearGroup.events, "asc").map((monthGroup) => (
              <div
                key={monthGroup.month + yearGroup.year}
                className="border rounded-xl bg-gray-100 p-2"
              >
                <h3 className="text-red-400 text-xl font-bold mb-2">
                  {t("years.month", {
                    month: monthNumberFormatter(
                      monthGroup.month,
                      i18n.language
                    ),
                  })}
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {monthGroup.events.map((event) => (
                    <SimpleEventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  const PUBLIC_URL = process.env.NEXT_PUBLIC_WEBSITE_URL;
  const events = await eventsAPI.getYearEvents();

  return {
    props: {
      events: events,
      headMetas: {
        title: YearPageMeta[locale as currentSupportLocale].title,
        des: YearPageMeta[locale as currentSupportLocale].description(
          12,
          events?.length || 0
        ),
        link: "/years",
      },
      structuredData: {
        breadcrumb: {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "年度时间轴",
              item: `https://${PUBLIC_URL}/years`,
            },
          ],
        },
      },
      ...(await serverSideTranslations(locale, ["common"])),
    },
    revalidate: 500,
  };
}
