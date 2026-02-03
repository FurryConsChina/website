import clsx from "clsx";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import "dayjs/locale/zh-tw";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useTranslation } from "next-i18next";
import Image from "@/components/image";
import { getEventCoverImgPath } from "@/utils/imageLoader";
import { sendTrack } from "@/utils/track";
import { currentSupportLocale } from "@/utils/meta";
import { getDayjsLocale } from "@/utils/locale";

import type { EventCardItem } from "@/types/event";
import styles from "@/components/eventCard/index.module.css";

let instancesCount = 0;

export default function EventCard({
  event,
  sizes,
  fallbackWidth,
  fallbackHeight,
}: {
  event: EventCardItem;
  sizes?: string;
  fallbackWidth?: number;
  fallbackHeight?: number;
}) {
  const { t, i18n } = useTranslation();
  const finalEventCoverImage = getEventCoverImgPath(event);
  const isDefaultCover = finalEventCoverImage.includes("fec-event-default-cover");

  useEffect(() => {
    instancesCount += 1;
    return () => {
      instancesCount -= 1;
    };
  }, []);

  const tags = useMemo(() => {
    const result = new Set<string>();
    if (!event) return [];
    if (event.features?.self) {
      event.features.self.forEach((f) => {
        result.add(f);
      });
    }
    if (event.commonFeatures) {
      event.commonFeatures.forEach((f) => {
        result.add(f.name);
      });
    }

    return Array.from(result);
  }, [event]);

  return (
    <Link
      href={`/${event.organization.slug}/${event.slug}`}
      onClick={() =>
        sendTrack({
          eventName: "click-event-card",
          eventValue: {
            href: `/${event.organization.slug}/${event.slug}`,
          },
        })
      }
    >
      <div
        onMouseEnter={() =>
          sendTrack({
            eventName: "hover-event-card",
            eventValue: {
              href: `/${event.organization.slug}/${event.slug}`,
            },
          })
        }
        className={clsx(
          "bg-white rounded-xl h-[150px] md:h-[384px] relative group md:outline md:outline-[5px] outline-white transition-all duration-300 drop-shadow-sm hover:shadow-2xl hover:-translate-y-2 overflow-hidden",
          "hover:outline-red-400 hover:scale-105",
        )}
      >
        <div className={clsx("flex md:flex-col justify-between md:justify-end h-full rounded-xl relative")}>
          <EventCover
            imageUrl={finalEventCoverImage}
            eventName={event.name}
            sizes={sizes}
            fallbackHeight={fallbackHeight}
            fallbackWidth={fallbackWidth}
            isDefault={isDefaultCover}
          />

          <div
            className={clsx(
              "w-[60%] md:w-full",
              // "md:h-2/5",
              "p-2 md:p-3",
              // tags.length && "group-hover:md:h-[50%]",
              "transition-all duration-300 rounded-r-xl md:rounded-xl z-10 bg-white/90 group-hover:md:bg-white",
              styles.eventCardDescContainer,
            )}
          >
            <div className="flex items-center justify-between1">
              <h5 aria-label="The name of the cons organizer" className={clsx("text-xs md:text-sm text-slate-500")}>
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
                "font-bold text-lg md:text-xl text-slate-800 group-hover:text-red-400 transition-colors duration-75 leading-5",
                "md:truncate md:group-hover:text-clip md:group-hover:whitespace-normal",
              )}
            >
              {[event.region?.localName, event.organization.name].filter(Boolean).join(" ")}
            </h4>

            <h5 aria-label="The name of the cons" className={clsx("text-xs md:text-sm text-slate-500")}>
              {event.name}
            </h5>

            <div className="mt-2 flex items-start text-xs md:text-sm text-slate-600 " suppressHydrationWarning>
              {/* <BsCalendar2DateFill className="mr-1 flex-shrink-0 text-xs h-5" /> */}
              <i className={clsx(styles.calendarIcon, "hidden md:block mr-1 flex-shrink-0 text-xs h-5")} />
              <EventDate event={event} locale={i18n.language as currentSupportLocale} />
            </div>

            <div className="mt-1 flex items-start text-xs md:text-sm text-slate-600 truncate group-hover:text-clip group-hover:whitespace-normal">
              {/* <IoLocation className="hidden md:block mr-1 flex-shrink-0 text-xs h-5" /> */}
              <i className={clsx(styles.locationIcon, "hidden md:block mr-1 flex-shrink-0 text-xs h-5")} />
              <EventAddress event={event} />
            </div>

            {!!tags.length && (
              <div className={clsx("mt-4", "")}>
                <Tags tags={tags} />
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function OrganizationPill({ logoUrl, organizationName }: { logoUrl: string | null; organizationName: string }) {
  const { t } = useTranslation();
  if (!logoUrl) return null;
  return (
    <div className="flex justify-between items-center rounded-full w-fit">
      {logoUrl && (
        <div className="hidden md:block border-2 rounded-full border-white">
          <Image
            src={logoUrl}
            alt={t("organization.logoAlt", { name: organizationName })}
            className={clsx("rounded-full object-cover w-[28px] h-[28px] bg-white")}
            width={100}
            height={100}
            sizes="100px"
            aria-label="organization's logo"
            autoFormat
            priority={instancesCount <= 3}
          />
        </div>
      )}
    </div>
  );
}

function EventCover({
  imageUrl,
  eventName,
  sizes,
  fallbackHeight,
  fallbackWidth,
}: {
  imageUrl: string;
  eventName: string;
  isDefault: boolean;
  sizes?: string;
  fallbackWidth?: number;
  fallbackHeight?: number;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={clsx(
        "relative md:absolute top-0 left-0 w-[40%] flex-grow-0 flex items-center justify-center",
        "md:w-full md:h-3/5",
        "md:group-hover:scale-125 transition-all duration-300",
      )}
    >
      <div className="relative flex items-center justify-center z-10 h-full md:w-full">
        <Image
          src={imageUrl}
          alt={t("event.coverAlt", { name: eventName })}
          containerClassName="relative md:absolute h-full"
          className={clsx("object-contain h-full")}
          sizes={sizes}
          autoFormat
          priority={instancesCount <= 3}
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
        priority={instancesCount <= 3}
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
  const distanceInTwoDate = useMemo(() => {
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
  }, [event.startAt, event.endAt, locale]);

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

function EventAddress({
  event,
}: {
  event: {
    region: { localName: string | null } | null;
    address: string | null;
  };
}) {
  const { t } = useTranslation();

  return (
    <span aria-label={t("event.aria.address")} className="truncate">
      {event.region?.localName} {event.address || t("event.unknown")}
    </span>
  );
}

function Tags({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-nowrap gap-1 scrollbar-hide overflow-x-auto scrollbar-width-0">
      {tags.map((t) => (
        <span className="text-xs bg-slate-100 px-1 rounded text-gray-700 whitespace-nowrap" key={t}>
          {t}
        </span>
      ))}
    </div>
  );
}
