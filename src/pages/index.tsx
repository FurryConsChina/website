import { useMemo, useState } from "react";
import { Field, Label, Switch } from "@headlessui/react";
import { groupBy } from "es-toolkit/compat";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { EventsAPI } from "@/api/events";
import EventCard from "@/components/eventCard";
import { FriendSiteBlock } from "@/components/layout/footer";
import { filteringEvents, groupByCustomDurationEvent, sortEvents } from "@/utils/event";
import { sendTrack } from "@/utils/track";

import { DurationType } from "@/types/list";
import { EventScale, EventStatus, type EventCardItem } from "@/types/event";
import { FeatureSchema } from "@/types/feature";
import { monthNumberFormatter } from "@/utils/locale";
import { keywordGenerator } from "@/utils/meta";
import SponsorBanner from "@/components/SponsorBanner";
import { endOfYear, startOfYear } from "date-fns";

export default function Home(props: { events: EventCardItem[] }) {
  const { t } = useTranslation();
  const [selectedFilter, setFilter] = useState({
    onlyAvailable: true,
    eventScale: ["all"],
  });

  const filteredEvents = filteringEvents(props.events, selectedFilter);
  const groupByCustomDurationEvents = groupByCustomDurationEvent(filteredEvents);

  return (
    <>
      <div>
        {/* <SponsorBanner /> */}
        <Filter selectedFilter={selectedFilter} onChange={(filter) => setFilter(filter)} />

        {filteredEvents.length === 0 && (
          <div className="bg-white border rounded-xl p-6 mt-6 text-center h-96 flex justify-center flex-col">
            <h1 className="text-xl text-red-400 font-bold">
              {t("homepage.noResult")}
              <br></br>
              {t("homepage.noResultTip")}
            </h1>
            <p className="text-base text-gray-400 mt-2">{t("homepage.noResultContact")}</p>
          </div>
        )}

        {Object.keys(groupByCustomDurationEvents).map((type) =>
          groupByCustomDurationEvents[type as DurationType].length ? (
            <DurationSection
              key={type}
              durationType={type}
              events={groupByCustomDurationEvents[type as DurationType]}
            />
          ) : null,
        )}

        <FriendSiteBlock />
      </div>
    </>
  );
}

function DurationSection({ durationType, events }: { durationType: string; events: EventCardItem[] }) {
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
      },
    );
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
      <div className="rounded-xl bg-gray-100/80 p-2 md:p-6 my-4">
        <h3 className="text-lg md:text-xl text-red-400 font-bold mb-2 md:mb-6">
          {t("homepage.group.status.now")}
          <span className="text-sm text-gray-500 font-bold ml-1">{t("homepage.total", { total: events.length })}</span>
        </h3>
        <div className="grid gap-4 md:gap-8 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortEvents(events, "asc").map((event) => (
            <EventCard
              key={event.id}
              event={event}
              sizes="(max-width: 750px) 650px, (max-width: 1080px) 552px, 552px"
              fallbackWidth={650}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {sortedMonths.map((month) => (
        <div key={month} className="rounded-xl bg-gray-100/80 p-2 md:p-6 my-4">
          <h3 className="text-lg md:text-xl text-red-400 font-bold mb-2 md:mb-6">
            {month !== "unknown"
              ? parseInt(month.split("-")[0]) === new Date().getFullYear()
                ? t("homepage.month", {
                    month: monthNumberFormatter(month.split("-")[1], i18n.language),
                  })
                : t("homepage.monthWithYear", {
                    year: parseInt(month.split("-")[0]),
                    month: monthNumberFormatter(month.split("-")[1], i18n.language),
                  })
              : null}
            <span className="text-sm text-gray-500 font-bold ml-1">
              {t("homepage.total", { total: groupByMonthEvent[month].length })}
            </span>
          </h3>
          <div className="grid gap-4 md:gap-8 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortEvents(groupByMonthEvent[month], "asc").map((event) => (
              <EventCard
                key={event.id}
                event={event}
                sizes="(max-width: 750px) 650px, (max-width: 1080px) 552px, 552px"
                fallbackWidth={650}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

const EventScaleScaleOptions = [
  { key: "all" },
  { key: EventScale.Cosy },
  { key: EventScale.Small },
  { key: EventScale.Medium },
  { key: EventScale.Large },
  { key: EventScale.XLarge },
];
function Filter({
  onChange,
  selectedFilter,
}: {
  onChange: (filter: { onlyAvailable: boolean; eventScale: (typeof EventScale)[keyof typeof EventScale][] }) => void;
  selectedFilter: {
    onlyAvailable: boolean;
    eventScale: (typeof EventScale)[keyof typeof EventScale][];
  };
}) {
  const { t } = useTranslation();
  const handleFilter = (key: string, value: unknown) => {
    sendTrack({
      eventName: "click-filter",
      eventValue: {
        filterName: key,
        filterValue: value,
      },
    });
    onChange({
      ...selectedFilter,
      [key]: value,
    });
  };

  const selectedScaleValue = EventScaleScaleOptions.filter((e) => selectedFilter.eventScale.includes(e.key));
  return (
    <div className="bg-white border rounded-xl p-6 flex sm:items-center flex-col sm:flex-row relative">
      <Field>
        <div className="flex items-center max-sm:mb-4 max-sm:justify-between">
          <Label className="mr-4 text-gray-600">{t("event.filter.onlyAvailable")}</Label>
          <Switch
            checked={selectedFilter.onlyAvailable}
            onChange={(v) => handleFilter("onlyAvailable", v)}
            className={`${
              selectedFilter.onlyAvailable ? "bg-red-400" : "bg-gray-200"
            } relative inline-flex h-6 w-11 items-center rounded-full`}
          >
            <span className="sr-only">{t("event.filter.onlyAvailable")}</span>
            <span
              className={`${
                selectedFilter.onlyAvailable ? "translate-x-6" : "translate-x-1"
              } inline-block h-4 w-4 transform rounded-full bg-white transition`}
            />
          </Switch>
        </div>
      </Field>

      <div className="bg-gray-100 w-[2px] h-4 mx-4 hidden sm:block" />

      <select
        value={selectedScaleValue[0].key}
        id="scale"
        onChange={(e) => handleFilter("eventScale", [e.target.value])}
        className="bg-white p-2 border rounded-xl text-gray-600"
      >
        {EventScaleScaleOptions.map((option) => (
          <option className="text-gray-600" key={option.key} value={option.key}>
            {t(`event.filter.${option.key}`)}
          </option>
        ))}
      </select>
    </div>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  const events = await EventsAPI.getEventList({
    current: "1",
    pageSize: "999",
    eventStartAt: startOfYear(new Date()).toISOString(),
    eventStatus: [
      EventStatus.EventScheduled,
      EventStatus.EventPostponed,
      EventStatus.EventRescheduled,
      EventStatus.EventMovedOnline,
    ],
  });

  return {
    props: {
      events: events.records.map((event) => ({
        id: event.id,
        slug: event.slug,
        name: event.name,
        startAt: event.startAt,
        endAt: event.endAt,
        scale: event.scale,
        type: event.type,
        locationType: event.locationType,
        address: event.address,
        region: event.region ? { localName: event.region.localName ?? null } : null,
        organization: {
          slug: event.organization.slug,
          name: event.organization.name,
        },
        features: event.features ? { self: event.features.self ?? null } : null,
        commonFeatures: event.commonFeatures ? event.commonFeatures.map((feature) => ({ name: feature.name })) : null,
        thumbnail: event.thumbnail,
        media: event.media?.images ? { images: event.media.images.map((image) => ({ url: image.url })) } : null,
      })),
      headMetas: {
        keywords: keywordGenerator({
          page: "home",
          locale: locale as "zh-Hans" | "en",
        }),
      },
      ...(await serverSideTranslations(locale, ["common"])),
    },
    revalidate: 500,
  };
}
