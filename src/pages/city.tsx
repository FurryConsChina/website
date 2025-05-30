import { eventGroupByYear } from "@/utils/event";
import { sendTrack } from "@/utils/track";
import groupBy from "lodash-es/groupBy";
import Link from "next/link";
import { useMemo } from "react";
import { getEventCoverImgPath } from "@/utils/imageLoader";
import { format } from "date-fns";
import Image from "@/components/image";
import { FaLink } from "react-icons/fa6";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { EventSchema, EventType } from "@/types/event";
import wfetch from "@/api";
import { z } from "zod";
import { CityPageMeta, currentSupportLocale } from "@/utils/meta";

export default function City(props: { events: EventType[] }) {
  const { events } = props;

  const groupByCityEvents = useMemo(() => {
    return groupBy(events, (event) => event.addressExtra?.city);
  }, [events]);

  const cities = useMemo(() => {
    return Object.keys(groupByCityEvents);
  }, [groupByCityEvents]);

  const groupByCityAndYearEvents = useMemo(() => {
    const output = cities.map((c) => ({
      location: c,
      eventsGroup: eventGroupByYear(groupByCityEvents[c], "desc"),
    }));
    return output;
  }, [cities, groupByCityEvents]);

  const groupByCityEventsSortByTotalCount = useMemo(() => {
    return cities.sort((prev, current) => {
      return groupByCityEvents[prev].length -
        groupByCityEvents[current].length >
        0
        ? -1
        : 1;
    });
  }, [cities, groupByCityEvents]);

  return (
    <>
      <div className="bg-white border p-6 rounded-xl">
        <ul className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {cities.map((city) => (
            <li key={city} className="group">
              <a
                href={`#${city}`}
                onClick={() =>
                  sendTrack({
                    eventName: "click-city-jump-link",
                    eventValue: {
                      value: city,
                      from: "city list",
                    },
                  })
                }
              >
                <h2 className="text-lg font-bold text-gray-600 flex items-center group-hover:text-red-400 transition duration-300">
                  <FaLink className="inline-block h-3 w-3 mr-1" />
                  {city}
                  <span className="text-sm font-normal ml-1">
                    {groupByCityEvents[city].length}个
                  </span>
                </h2>
              </a>
            </li>
          ))}
        </ul>

        <p className="text-gray-600 mt-4">
          我们共在 {cities.length} 个城市收录到 {events.length}{" "}
          个活动，其中，举办活动场数最多的城市是{" "}
          <span className="font-bold">
            {groupByCityEventsSortByTotalCount[0]}
          </span>
          ！紧随其后的是
          <span className="font-bold">
            {groupByCityEventsSortByTotalCount[1]}
          </span>
          ，而举办活动场数排名第三的城市是{" "}
          <span className="font-bold">
            {groupByCityEventsSortByTotalCount[2]} 🎉。
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 bg-white border p-6 rounded-xl mt-6">
        {groupByCityAndYearEvents.map((city) => (
          <div id={city.location} key={city.location}>
            <h2 className="text-2xl font-bold text-gray-600">
              {city.location}
            </h2>
            <div className="grid grid-cols-1 gap-4 mt-4">
              {city.eventsGroup.map((yearGroup) => (
                <div key={`${city}${yearGroup.year}`}>
                  <h3 className="text-gray-500">
                    {yearGroup.year === "no-date" ? "暂未定档" : yearGroup.year}
                  </h3>
                  <CityYearSelection events={yearGroup.events} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function CityYearSelection({ events }: { events: EventType[] }) {
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

const PartialOrganizationSchema = z.object({
  organization: EventSchema.shape.organization.pick({
    name: true,
    slug: true,
  }),
});

const CityResponseSchema = EventSchema.pick({
  name: true,
  slug: true,
  thumbnail: true,
  poster: true,
  startAt: true,
  endAt: true,
  addressExtra: true,
}).merge(PartialOrganizationSchema);

export async function getStaticProps({ locale }: { locale: string }) {
  const PUBLIC_URL = process.env.NEXT_PUBLIC_URL;
  const response = await wfetch.get("/internal/cms/event/all").json();
  const events = z.array(CityResponseSchema).safeParse(response).data;

  if (!events) {
    return {
      notFound: true,
    };
  }

  const cities = Object.keys(
    groupBy(events, (item) => item.addressExtra?.city)
  );

  return {
    props: {
      events: events,
      headMetas: {
        title: CityPageMeta[locale as currentSupportLocale].title,
        des: CityPageMeta[locale as currentSupportLocale].description(
          cities.length,
          events.length
        ),
        link: "/city",
      },
      structuredData: {
        breadcrumb: {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "城市",
              item: `https://${PUBLIC_URL}/city`,
            },
          ],
        },
      },
      ...(await serverSideTranslations(locale, ["common"])),
    },
    revalidate: 500,
  };
}
