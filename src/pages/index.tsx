import { useMemo, useState } from "react";
import { Field, Label, Switch } from "@headlessui/react";
import groupBy from "lodash-es/groupBy";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { z } from "zod";

import wfetch from "@/api";
import EventCard from "@/components/eventCard";
import { FriendSiteBlock } from "@/components/layout/footer";
import {
  filteringEvents,
  groupByCustomDurationEvent,
  sortEvents,
} from "@/utils/event";
import { sendTrack } from "@/utils/track";

import { DurationType } from "@/types/list";
import { EventScale, EventStatus, type EventType } from "@/types/event";
import { FeatureSchema } from "@/types/feature";

export default function Home(props: { events: EventType[] }) {
  const { t } = useTranslation();
  const [selectedFilter, setFilter] = useState({
    onlyAvailable: true,
    eventScale: ["all"],
  });

  const filteredEvents = filteringEvents(props.events, selectedFilter);
  const groupByCustomDurationEvents =
    groupByCustomDurationEvent(filteredEvents);

  return (
    <>
      <div>
        <Filter
          selectedFilter={selectedFilter}
          onChange={(filter) => setFilter(filter)}
        />

        {filteredEvents.length === 0 && (
          <div className="bg-white border rounded-xl p-6 mt-6 text-center h-96 flex justify-center flex-col">
            <h1 className="text-xl text-red-400 font-bold">
              {t("homepage.noResult")}
              <br></br>
              {t("homepage.noResultTip")}
            </h1>
            <p className="text-base text-gray-400 mt-2">
              {t("homepage.noResultContact")}
            </p>
          </div>
        )}

        {Object.keys(groupByCustomDurationEvents).map((type) =>
          groupByCustomDurationEvents[type as DurationType].length ? (
            <DurationSection
              key={type}
              durationType={type}
              events={groupByCustomDurationEvents[type as DurationType]}
            />
          ) : null
        )}

        <FriendSiteBlock />
      </div>
    </>
  );
}

function DurationSection({
  durationType,
  events,
}: {
  durationType: string;
  events: EventType[];
}) {
  const { t } = useTranslation();
  const groupByDateEvent = useMemo(() => {
    return groupBy(events, (event) =>
      // Some event open in the last day of start month, but it should be count in next month.
      event.endAt ? new Date(event.endAt).getUTCMonth() + 1 : "unknown"
    );
  }, [events]);

  const months =
    durationType === DurationType.Passed
      ? Object.keys(groupByDateEvent).reverse()
      : Object.keys(groupByDateEvent);

  return (
    <>
      {months.map((month) => (
        <div key={month} className="rounded-xl bg-gray-100/80 p-2 md:p-6 my-4">
          <h3 className="text-lg md:text-xl text-red-400 font-bold mb-2 md:mb-6">
            {month !== "unknown"
              ? durationType === DurationType.NextYear
                ? t("homepage.nextYearMonth", { month })
                : t("homepage.month", { month })
              : null}
            <span className="text-sm text-gray-500 font-bold ml-1">
              {t("homepage.total", { total: groupByDateEvent[month].length })}
            </span>
          </h3>
          <div className="grid gap-4 md:gap-8 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortEvents(groupByDateEvent[month], "asc").map((event) => (
              <EventCard
                key={event.name}
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
  { key: "all", name: "我全都要（全部）" },
  { key: EventScale.Cosy, name: "三两小聚（小型展）" },
  { key: EventScale.Small, name: "有点厉害（中型展）" },
  { key: EventScale.Medium, name: "好多人啊（大型展）" },
];
function Filter({
  onChange,
  selectedFilter,
}: {
  onChange: (filter: {
    onlyAvailable: boolean;
    eventScale: (typeof EventScale)[keyof typeof EventScale][];
  }) => void;
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

  const selctedScaleValue = EventScaleScaleOptions.filter((e) =>
    selectedFilter.eventScale.includes(e.key)
  );
  return (
    <div className="bg-white border rounded-xl p-6 flex sm:items-center flex-col sm:flex-row relative">
      <Field>
        <div className="flex items-center max-sm:mb-4 max-sm:justify-between">
          <Label className="mr-4 text-gray-600">
            {t("event.filter.onlyAvailable")}
          </Label>
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
        value={selctedScaleValue[0].key}
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
  const events = await wfetch.get("/event/home").json();

  const homeSchema = z.array(
    z.object({
      name: z.string(),
      address: z.string().nullable(),
      addressExtra: z.object({ city: z.string().nullable() }).nullable(),
      thumbnail: z.string().nullable(),
      poster: z.object({}).nullable(),
      startAt: z.string().datetime().nullable(),
      endAt: z.string().datetime().nullable(),
      slug: z.string(),
      // status: z.string(),
      scale: z.string(),
      organization: z.object({
        slug: z.string(),
        name: z.string(),
        logoUrl: z.string().nullable(),
      }),
      commonFeatures: z.array(FeatureSchema).nullish(),
      features: z
        .object({
          self: z.array(z.string()).nullish(),
        })
        .nullish(),
    })
  );

  const validEvents = homeSchema.safeParse(events);
  const finalEvents = validEvents.data;

  return {
    props: {
      events: finalEvents,
      ...(await serverSideTranslations(locale, ["common"])),
    },
    revalidate: 86400,
  };
}
