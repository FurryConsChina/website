import clsx from "clsx";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import "dayjs/locale/zh-tw";
import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "next-i18next/pages";
import Image from "@/components/Image";
import { getEventCoverImgPath } from "@/utils/imageLoader";
import { sendTrack } from "@/utils/track";
import { getEventDetailUrl } from "@/utils/url";
import { currentSupportLocale, getDayjsLocale } from "@/utils/locale";

import type { EventCardItem } from "@/types/event";
import styles from "@/components/EventCard/index.module.css";

export default function EventCard({
  event,
  sizes,
  fallbackWidth,
  fallbackHeight,
  priority = false,
}: {
  event: EventCardItem;
  sizes?: string;
  fallbackWidth?: number;
  fallbackHeight?: number;
  priority?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const eventUrl = getEventDetailUrl({ urlKey: event.urlKey });
  const finalEventCoverImage = getEventCoverImgPath(event);
  const isDefaultCover = finalEventCoverImage.includes("fec-event-default-cover");

  const tags = useMemo(() => {
    const result = new Set<string>();
    if (!event) return [];
    event.features?.forEach((f) => {
      result.add(f.name);
    });

    return Array.from(result);
  }, [event]);

  return (
    <Link
      href={eventUrl}
      onClick={() =>
        sendTrack({
          eventName: "click-event-card",
          eventValue: {
            href: eventUrl,
          },
        })
      }
    >
      <div
        onMouseEnter={() =>
          sendTrack({
            eventName: "hover-event-card",
            eventValue: {
              href: eventUrl,
            },
          })
        }
        className={clsx(
          "bg-white rounded-xl md:h-[384px] relative group md:outline md:outline-[5px] outline-white transition-all duration-300 drop-shadow-sm md:hover:shadow-2xl md:hover:-translate-y-2 overflow-hidden",
          "md:hover:outline-red-400 md:hover:scale-105 active:scale-[0.99]",
        )}
      >
        <div className={clsx("flex md:flex-col justify-between md:justify-end md:h-full rounded-xl relative")}>
          <EventCover
            imageUrl={finalEventCoverImage}
            eventName={event.name}
            sizes={sizes}
            fallbackHeight={fallbackHeight}
            fallbackWidth={fallbackWidth}
            isDefault={isDefaultCover}
            priority={priority}
          />

          <div
            className={clsx(
              "w-[64%] sm:w-[68%] md:w-full min-w-0",
              // "md:h-2/5",
              "p-2.5 sm:p-3",
              // tags.length && "group-hover:md:h-[50%]",
              "transition-all duration-300 rounded-r-xl md:rounded-xl z-10 bg-white/90 group-hover:md:bg-white",
              styles.eventCardDescContainer,
            )}
          >
            <div className="flex items-center">
              <h5
                aria-label="The name of the cons organizer"
                className={clsx("text-[11px] sm:text-xs md:text-sm text-slate-500")}
              >
                {[
                  event.locationType && t(`event.locationType.${event.locationType}`),
                  event.type && t(`event.type.${event.type}`),
                ]
                  .filter(Boolean)
                  .join(" ")}
              </h5>
            </div>

            <h4
              className={clsx(
                "font-bold text-base sm:text-lg md:text-xl text-slate-800 group-hover:text-red-400 transition-colors duration-75 leading-snug md:leading-5 mt-0.5 md:mt-0",
                "line-clamp-2 md:line-clamp-none md:truncate md:group-hover:text-clip md:group-hover:whitespace-normal",
              )}
            >
              {[
                event.region?.localName,
                [event.organization?.name, ...event.organizations.map((o) => o.name)].filter(Boolean).join("·"),
              ]
                .filter(Boolean)
                .join(" ")}
            </h4>

            <h5 aria-label="The name of the cons" className={clsx("text-xs md:text-sm text-slate-500 truncate mt-0.5")}>
              {event.name}
            </h5>

            <div
              className="mt-1.5 md:mt-2 flex items-center md:items-start text-xs md:text-sm text-slate-600"
              suppressHydrationWarning
            >
              {/* <BsCalendar2DateFill className="mr-1 flex-shrink-0 text-xs h-5" /> */}
              <i className={clsx(styles.calendarIcon, "block mr-1.5 md:mr-1 flex-shrink-0 text-xs h-4 md:h-5")} />
              <span className="truncate">
                <EventDate event={event} locale={i18n.language as currentSupportLocale} />
              </span>
            </div>

            <div className="mt-1 flex items-center md:items-start text-xs md:text-sm text-slate-600 truncate group-hover:text-clip group-hover:whitespace-normal">
              {/* <IoLocation className="hidden md:block mr-1 flex-shrink-0 text-xs h-5" /> */}
              <i className={clsx(styles.locationIcon, "block mr-1.5 md:mr-1 flex-shrink-0 text-xs h-4 md:h-5")} />
              <EventLocation event={event} />
            </div>

            {!!tags.length && (
              <div className={clsx("mt-2 md:mt-4")}>
                <Tags tags={tags} />
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function EventCover({
  imageUrl,
  eventName,
  sizes,
  fallbackHeight,
  fallbackWidth,
  priority,
}: {
  imageUrl: string;
  eventName: string;
  isDefault: boolean;
  sizes?: string;
  fallbackWidth?: number;
  fallbackHeight?: number;
  priority?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={clsx(
        "relative self-stretch overflow-hidden md:absolute top-0 left-0 w-[36%] sm:w-[32%] flex-grow-0 flex items-center justify-center",
        "md:w-full md:h-3/5",
        "md:group-hover:scale-125 transition-all duration-300",
      )}
    >
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <Image
          src={imageUrl}
          alt={t("event.coverAlt", { name: eventName })}
          containerClassName="relative h-full"
          className={clsx("object-contain h-full w-full")}
          sizes={sizes}
          autoFormat
          priority={priority}
          fallbackHeight={fallbackHeight}
          fallbackWidth={fallbackWidth}
        />
      </div>

      <Image
        src={imageUrl}
        alt={t("event.coverBackgroundAlt", { name: eventName })}
        containerClassName="absolute top-0 left-0 h-full w-full"
        className={clsx("object-cover h-full w-full blur-3xl")}
        sizes={sizes}
        autoFormat
        fallbackHeight={fallbackHeight}
        fallbackWidth={fallbackWidth}
      />
    </div>
  );
}

export function EventDate({
  event,
  locale = "zh-Hans",
}: {
  event: { startAt: string | null; endAt: string | null };
  locale?: currentSupportLocale;
}) {
  const { t } = useTranslation();
  const dayjsLocale = getDayjsLocale(locale);
  const distanceInTwoDate = (() => {
    if (!event.startAt || !event.endAt) return;

    const startDate = dayjs(event.startAt).startOf("day");
    const endDate = dayjs(event.endAt).startOf("day");
    const result = endDate.diff(startDate, "day") + 1;

    if (startDate.isSame(endDate, "day")) {
      return t("date.duration.singleDay");
    }

    if (result) {
      return t("date.duration.multiDay", { count: result });
    }

    return null;
  })();

  const startDateMonth = useMemo(() => {
    if (event.startAt) {
      return `${dayjs(event.startAt).locale(dayjsLocale).format("YYYY/MM")}`;
    }

    return null;
  }, [event.startAt, dayjsLocale]);

  const startDateLabel = useMemo(() => {
    if (event.startAt) {
      return `${dayjs(event.startAt).locale(dayjsLocale).format("YYYY/MM/DD")}(${dayjs(event.startAt)
        .locale(dayjsLocale)
        .format("ddd")})`;
    }

    return null;
  }, [event.startAt, dayjsLocale]);

  const endDateLabel = useMemo(() => {
    if (event.endAt) {
      return `${dayjs(event.endAt).locale(dayjsLocale).format("MM/DD")}(${dayjs(event.endAt)
        .locale(dayjsLocale)
        .format("ddd")})`;
    }

    return null;
  }, [event.endAt, dayjsLocale]);

  if (!startDateLabel || !endDateLabel) {
    return startDateMonth || t("event.unknown");
  }

  if (distanceInTwoDate) {
    return `${distanceInTwoDate} ${startDateLabel} - ${endDateLabel}`;
  }

  return `${startDateLabel} - ${endDateLabel}`;
}

function EventLocation({
  event,
}: {
  event: {
    region: { localName: string | null } | null;
    placeName: string | null;
  };
}) {
  const { t } = useTranslation();

  return (
    <span aria-label={t("event.aria.location")} className="truncate">
      {event.region?.localName} {event.placeName || t("event.unknown")}
    </span>
  );
}

function Tags({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-nowrap gap-1 scrollbar-hide overflow-x-auto scrollbar-width-0">
      {tags.map((t) => (
        <span
          className="text-[11px] md:text-xs bg-slate-100 px-1.5 py-0.5 rounded text-gray-700 whitespace-nowrap"
          key={t}
        >
          {t}
        </span>
      ))}
    </div>
  );
}
