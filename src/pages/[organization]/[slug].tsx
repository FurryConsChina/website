import { EventsAPI } from "@/api/events";
import EventMapCard from "@/components/event/EventMapCard";
import EventOrganizationCard from "@/components/event/EventOrganizationCard";
import EventSourceButton from "@/components/event/EventSourceButton";
import { EventDate } from "@/components/eventCard";
import NextImage from "@/components/image";
import { EventStatus } from "@/constants/event";
import type { EventItem } from "@/types/event";
import { getEventCoverImgPath, imageUrl } from "@/utils/imageLoader";
import { currentSupportLocale, formatLocale } from "@/utils/locale";
import { eventDescriptionGenerator, keywordGenerator } from "@/utils/meta";
import { generateEventDetailStructuredData } from "@/utils/structuredData";
import { getEventDetailUrl } from "@/utils/url";
import clsx from "clsx";
import { GetServerSidePropsContext } from "next";
import { useTranslation } from "next-i18next/pages";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import { BsCalendar2DateFill } from "react-icons/bs";
import { FaHotel, FaPeoplePulling } from "react-icons/fa6";
import { IoLocation } from "react-icons/io5";
import { RiErrorWarningLine } from "react-icons/ri";
import * as z from "zod/v4";

export default function EventDetail({ event }: { event: EventItem }) {
  const { t, i18n } = useTranslation();

  const finalEventCoverImage = getEventCoverImgPath(event);

  const showDescriptionContainer = !!(event.detail || event.media?.images?.length);

  return (
    <>
      <div className={clsx("flex border bg-white rounded-xl min-h-[500px] overflow-hidden", "lg:flex-row flex-col")}>
        <div className={clsx("event-detail__left", "lg:w-7/12 w-full h-[500px]")}>
          <div className={clsx("relative text-center h-full")}>
            <NextImage
              containerClassName="relative z-20"
              priority
              src={finalEventCoverImage}
              alt={t("event.coverAlt", { name: event.name })}
              className="mx-auto h-full object-contain z-20 relative"
              autoFormat
            />

            <NextImage
              containerClassName="absolute top-0 left-0 w-full h-full z-10 blur brightness-50"
              src={finalEventCoverImage}
              alt={t("event.coverAlt", { name: event.name })}
              className="mx-auto h-full w-full object-cover"
              autoFormat
            />
          </div>
        </div>
        <div
          className={clsx(
            "event-detail__right",
            "p-6 bg-white z-10 flex",
            "flex-col sm:flex-row sm:max-lg:items-end lg:flex-col",
            "w-full lg:w-5/12",
          )}
        >
          <div className="flex-grow">
            {event.status === EventStatus.EventCancelled && (
              <p className="inline-flex items-center bg-red-400 mb-2 px-4 py-2 text-white rounded-md">
                <RiErrorWarningLine className="mr-2 text-lg" />
                {t("event.status.cancel")}
              </p>
            )}

            <h2 aria-label={t("event.aria.name")} className="font-bold text-3xl text-gray-700">
              {event.name}
            </h2>
            <h2 className="text-gray-600 text-sm flex">
              {t("event.hostBy", {
                hostName: event.organizations.length
                  ? event.organization.name + "、" + event.organizations.map((organization) => organization.name).join("、")
                  : event.organization?.name,
              })}
              {/* <EventStatusBar className="ml-2" pageviews="0" fav="2" /> */}
            </h2>

            <p aria-label={t("event.aria.location")} className="flex items-center text-gray-500 mt-4">
              <IoLocation className="text-gray-500 inline-block mr-2" />
              {`${event.region?.localName || t("event.unknown")} · ${
                event.address ? event.address : t("event.unknown")
              }`}
            </p>

            <p aria-label={t("event.aria.time")} className="flex items-center text-gray-500">
              <BsCalendar2DateFill className="text-gray-500 inline-block mr-2" />
              <EventDate event={event} locale={i18n.language as currentSupportLocale} />
            </p>

            {!!event.type && !!event.locationType && (
              <p aria-label={t("event.aria.venueType")} className="flex items-center text-gray-500">
                <FaHotel className="text-gray-500 inline-block mr-2" />

                {[
                  event.locationType && t(`event.locationType.${event.locationType}`),
                  event.type && t(`event.type.${event.type}`),
                ]
                  .filter(Boolean)
                  .join(" ")}
              </p>
            )}

            <p aria-label={t("event.aria.scale")} className="flex items-center text-gray-500">
              <FaPeoplePulling className="text-gray-500 inline-block mr-2" />
              {t("event.scaleDes", { scale: t(`event.scale.${event.scale}`) })}
            </p>
          </div>

          <EventSourceButton sources={event.sources || []} eventName={event.name} />
        </div>
      </div>

      <EventMapCard
        key={`${event.addressLat ?? ""}:${event.addressLon ?? ""}`}
        latitudeText={event.addressLat}
        longitudeText={event.addressLon}
      />

      <div className="flex my-4 lg:items-start flex-col-reverse md:flex-row">
        {showDescriptionContainer && (
          <div id="event-detail__left" className="md:w-8/12">
            {event.detail && (
              <div className="bg-white rounded-xl flex-grow p-6 md:mr-4 mb-4">
                <p
                  className="text-gray-600 whitespace-pre-line break-words"
                  dangerouslySetInnerHTML={{ __html: event.detail }}
                />
              </div>
            )}

            {!!event.media?.images?.length && (
              <div className="bg-white rounded-xl flex-grow p-6 md:mr-4">
                {event.media?.images?.map((cover, index) => (
                  <div className="relative" key={cover.url}>
                    <NextImage
                      alt={t("event.detailImageAlt", {
                        name: event.name,
                        index: index + 1,
                      })}
                      src={cover.url}
                      className="w-full"
                      priority
                      autoFormat
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <EventOrganizationCard key={event.id} event={event} showDescriptionContainer={showDescriptionContainer} />
      </div>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  try {
    const { locale } = context;

    const eventParamsSchema = z.object({
      slug: z
        .string()
        .min(1)
        .regex(/^[a-zA-Z0-9-]+$/),
      organization: z
        .string()
        .min(1)
        .regex(/^[a-zA-Z0-9-]+$/),
    });

    const reqParamsParseResult = eventParamsSchema.parse({
      slug: context.params?.slug,
      organization: context.params?.organization,
    });

    const event = await EventsAPI.getEventDetail(reqParamsParseResult.slug, reqParamsParseResult.organization);

    if (!event) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        event: event,
        headMetas: {
          title: `${event?.name}-${event?.organization?.name}`,
          keywords: keywordGenerator({
            page: "event",
            locale: formatLocale(locale),
            event: {
              name: event?.name,
              startDate: event?.startAt,
              city: event.region?.localName || undefined,
            },
          }),
          des: eventDescriptionGenerator(formatLocale(locale), event),
          url: getEventDetailUrl({
            eventSlug: event.slug,
            organizationSlug: event.organization.slug,
            locale: formatLocale(locale),
            fullUrl: false,
          }),
          cover: imageUrl(getEventCoverImgPath(event)),
        },
        structuredData: generateEventDetailStructuredData({
          event,
          locale: formatLocale(locale),
        }),
        ...(locale ? await serverSideTranslations(locale, ["common"]) : {}),
      },
    };
  } catch (error) {
    console.error(error);
    return {
      notFound: true,
    };
  }
}
