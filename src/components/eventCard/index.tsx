import Link from "next/link";
import React, { useEffect, useMemo } from "react";
import clsx from "clsx";
import { format, differenceInDays, isSameDay } from "date-fns";
import { zhCN } from "date-fns/locale";

import Image from "@/components/image";
import { sendTrack } from "@/utils/track";
import { getEventCoverImgPath } from "@/utils/imageLoader";

import type { EventType } from "@/types/event";

import styles from "@/components/eventCard/index.module.css";

let instancesCount = 0;

export default function EventCard({
  event,
  sizes,
  fallbackWidth,
  fallbackHeight,
}: {
  event: EventType;
  sizes?: string;
  fallbackWidth?: number;
  fallbackHeight?: number;
}) {
  const finalEventCoverImage = getEventCoverImgPath(event);
  const isDefaultCover = finalEventCoverImage.includes(
    "fec-event-default-cover"
  );

  useEffect(() => {
    instancesCount += 1;
    return () => {
      instancesCount -= 1;
    };
  }, []);

  return (
    <Link
      href={`/${event.organization?.slug}/${event.slug}`}
      onClick={() =>
        sendTrack({
          eventName: "click-event-card",
          eventValue: {
            href: `/${event.organization?.slug}/${event.slug}`,
          },
        })
      }
    >
      <div
        onMouseEnter={() =>
          sendTrack({
            eventName: "hover-event-card",
            eventValue: {
              href: `/${event.organization?.slug}/${event.slug}`,
            },
          })
        }
        className={clsx(
          "bg-white rounded-xl h-48 md:h-[300px] relative group md:outline md:outline-[5px] outline-white transition-all duration-300 drop-shadow-sm hover:shadow-2xl hover:-translate-y-2 overflow-hidden",
          "hover:outline-red-400"
        )}
      >
        <div
          className={clsx(
            "flex md:flex-col justify-between md:justify-end h-full rounded-xl relative"
          )}
        >
          <div
            className={clsx(
              "hidden md:block md:absolute z-20 right-0 top-0 md:mt-2 md:mr-2"
            )}
          >
            <OrganizationPill
              logoUrl={event.organization.logoUrl}
              organizationName={event.organization.name}
            />
          </div>

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
              "w-1/2",
              "md:w-full md:h-2/5 group-hover:md:h-[90%]",
              "p-2 md:p-4 transition-all duration-300 rounded-r-xl md:rounded-xl z-10 bg-white/90 group-hover:md:bg-white/60",
              styles.eventCardDescContainer
            )}
          >
            <h5
              aria-label="The name of the cons organizer"
              className={clsx("text-xs md:text-sm text-slate-500")}
            >
              {event.addressExtra?.city} {event.organization.name}
            </h5>

            <h4 className="font-bold text-lg md:text-xl text-slate-800 group-hover:text-red-400 transition-colors duration-300 leading-5 truncate group-hover:text-clip group-hover:whitespace-normal">
              {event.name}
            </h4>

            <div
              className="mt-2 flex items-start text-xs md:text-sm text-slate-600 "
              suppressHydrationWarning
            >
              {/* <BsCalendar2DateFill className="mr-1 flex-shrink-0 text-xs h-5" /> */}
              <i
                className={clsx(
                  styles.calendarIcon,
                  "hidden md:block mr-1 flex-shrink-0 text-xs h-5"
                )}
              />
              <EventDate event={event} />
            </div>

            <div className="mt-1 flex items-start text-xs md:text-sm text-slate-600 truncate group-hover:text-clip group-hover:whitespace-normal">
              {/* <IoLocation className="hidden md:block mr-1 flex-shrink-0 text-xs h-5" /> */}
              <i
                className={clsx(
                  styles.locationIcon,
                  "hidden md:block mr-1 flex-shrink-0 text-xs h-5"
                )}
              />
              <EventAddress event={event} />
            </div>

            <div className="mt-4 md:hidden group-hover:block">
              <Tags />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function OrganizationPill({
  logoUrl,
  organizationName,
}: {
  logoUrl: string | null;
  organizationName: string;
}) {
  if (!logoUrl) return null;
  return (
    <div className="flex justify-between items-center rounded-full w-fit">
      {logoUrl && (
        <div className="hidden md:block border-2 rounded-full border-white group-hover:animate-spin">
          <Image
            src={logoUrl}
            alt={`${organizationName}的展会标志`}
            className={clsx(
              "rounded-full object-cover w-[28px] h-[28px] bg-white"
            )}
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
  return (
    <div
      className={clsx(
        "relative w-1/2 flex-grow-0 flex items-center justify-center",
        "md:w-full md:h-3/5",
        "group-hover:brightness-50 transition-all duration-300"
      )}
    >
      <div className="relative flex items-center justify-center z-10 h-full md:w-full">
        <Image
          src={imageUrl}
          alt={`${eventName}的活动封面`}
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
        alt={`${eventName} mask filter`}
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

function EventBackgroundBlur({
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
  return (
    <div>
      <Image
        src={imageUrl}
        alt={`${eventName} mask filter`}
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

function EventDate({ event }: { event: EventType }) {
  const distanceInTwoDate = useMemo(() => {
    if (!event.startAt || !event.endAt) return;
    const result = differenceInDays(
      new Date(event.endAt),
      new Date(event.startAt)
    );

    if (result) {
      return `${result}天`;
    }

    if (isSameDay(event.startAt, event.endAt)) {
      return "1天";
    }

    return null;
  }, [event.startAt, event.endAt]);

  const startDateLabel = useMemo(() => {
    if (event.startAt) {
      return `${format(event.startAt, "yyyy/MM/dd", {
        locale: zhCN,
      })}(${format(event.startAt, "E", { locale: zhCN })})`;
    }

    return null;
  }, [event.startAt]);

  const endDateLabel = useMemo(() => {
    if (event.endAt) {
      return `${format(event.endAt, "MM/dd", {
        locale: zhCN,
      })}(${format(event.endAt, "E", { locale: zhCN })})`;
    }

    return null;
  }, [event.endAt]);

  if (!startDateLabel || !endDateLabel) {
    return "大概是这个月";
  }

  if (distanceInTwoDate) {
    return `${distanceInTwoDate} ${startDateLabel} - ${endDateLabel}`;
  }

  return `${startDateLabel} - ${endDateLabel}`;
}

function EventAddress({ event }: { event: EventType }) {
  return (
    <span
      aria-label="活动地址"
      className="truncate group-hover:text-clip group-hover:whitespace-normal"
    >
      {event.addressExtra?.city} {event.address || "尚未公布"}
    </span>
  );
}

function Tags() {
  const tags: string[] = [];
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((t) => (
        <span
          className="text-xs bg-slate-100 px-1 rounded text-gray-700"
          key={t}
        >
          {t}
        </span>
      ))}
    </div>
  );
}
