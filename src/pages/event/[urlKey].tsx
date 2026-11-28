import { InfraAPI } from "@/api/infra";
import { EventsAPI } from "@/api/events";
import EventImageAnchors, { getEventImageAnchorId, getEventImageAnchors } from "@/components/event/EventImageAnchors";
import EventMapCard from "@/components/event/EventMapCard";
import EventOffersCard from "@/components/event/EventOffersCard";
import EventOrganizationCard from "@/components/event/EventOrganizationCard";
import EventSourceButton from "@/components/event/EventSourceButton";
import { EventDate } from "@/components/EventCard";
import NextImage from "@/components/Image";
import PageviewTag from "@/components/PageviewHeatTag";
import { EventStatus } from "@/constants/event";
import type { EventItem } from "@/types/event";
import { parseCoordinates } from "@/utils/coordinate";
import { getEventOfferPriceSummary, getEventOrganizations } from "@/utils/event";
import { getEventCoverImgPath, imageUrl } from "@/utils/imageLoader";
import { currentSupportLocale, formatLocale } from "@/utils/locale";
import { eventDescriptionGenerator, keywordGenerator } from "@/utils/meta";
import { generateEventDetailStructuredData } from "@/utils/structuredData";
import { getEventDetailUrl } from "@/utils/url";
import clsx from "clsx";
import { GetServerSidePropsContext } from "next";
import { useState } from "react";
import { useTranslation } from "next-i18next/pages";
import { getLayoutProps } from "@/utils/layoutProps";
import { BsCalendar2DateFill } from "react-icons/bs";
import { FaHotel, FaPeoplePulling } from "react-icons/fa6";
import { IoLocation, IoTicket } from "react-icons/io5";
import { RiErrorWarningLine } from "react-icons/ri";
import * as z from "zod/v4";
import axios from "axios";

export default function EventDetail({ event, pageviewCount }: { event: EventItem; pageviewCount: number | null }) {
  const { t, i18n } = useTranslation();

  const finalEventCoverImage = getEventCoverImgPath(event);
  const { primary: primaryOrganization, others: coOrganizations } = getEventOrganizations(event);
  const hostOrganizations = primaryOrganization ? [primaryOrganization, ...coOrganizations] : coOrganizations;

  const showDescriptionContainer = !!(event.detail || event.media?.images?.length);
  const hasValidCoordinates = parseCoordinates(event.location.place?.latitude, event.location.place?.longitude).isValid;
  const hasOrganization = hostOrganizations.length > 0;
  const showMobileTabs = hasValidCoordinates && hasOrganization;
  const [mobileTab, setMobileTab] = useState<"organization" | "map">("organization");
  const mapKey = `${event.location.place?.latitude ?? ""}:${event.location.place?.longitude ?? ""}`;
  const priceSummary = getEventOfferPriceSummary(event.offers);
  const imageAnchors = getEventImageAnchors(event.media?.images);
  const hasDesktopSidebar = hasOrganization || imageAnchors.length > 0;

  return (
    <>
      <div
        className={clsx("relative z-20 flex bg-white shadow-sm rounded-xl lg:min-h-[500px]", "lg:flex-row flex-col")}
      >
        <div
          className={clsx(
            "event-detail__left",
            "lg:w-7/12 w-full h-[280px] xs:h-[340px] sm:h-[420px] lg:h-[500px] overflow-hidden rounded-t-xl lg:rounded-l-xl lg:rounded-tr-none",
          )}
        >
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
        <div className={clsx("event-detail__right", "p-4 sm:p-6 bg-white z-10 flex flex-col", "w-full lg:w-5/12")}>
          <div className="flex-grow">
            {event.status === EventStatus.EventCancelled && (
              <p className="inline-flex items-center bg-red-400 mb-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base text-white rounded-md">
                <RiErrorWarningLine className="mr-1.5 sm:mr-2 text-lg shrink-0" />
                {t("event.status.cancel")}
              </p>
            )}

            <div className="flex flex-wrap items-baseline gap-2 gap-y-1">
              <h1
                aria-label={t("event.aria.name")}
                className="font-bold text-xl sm:text-2xl md:text-3xl text-gray-700 leading-snug"
              >
                {event.name}
              </h1>
            </div>
            <h2 className="text-gray-600 text-xs sm:text-sm flex flex-wrap items-center gap-2 mt-1">
              {t("event.hostBy", {
                hostName: hostOrganizations.map((organization) => organization.name).join("、"),
              })}
              <PageviewTag count={pageviewCount} />
            </h2>

            <div className="mt-3 sm:mt-4 space-y-2 text-sm sm:text-base">
              <p aria-label={t("event.aria.location")} className="flex items-start text-gray-500">
                <IoLocation className="text-gray-500 shrink-0 mt-1 mr-2" />
                <span className="min-w-0 break-words">
                  {`${event.location.region?.localName || t("event.unknown")} · ${
                    event.location.place?.name || t("event.unknown")
                  }`}
                  {event.location.place?.address && event.location.place.address !== event.location.place.name && (
                    <span className="block text-xs sm:text-sm text-gray-400 mt-0.5">
                      {event.location.place.address}
                    </span>
                  )}
                </span>
              </p>

              <p aria-label={t("event.aria.time")} className="flex items-start sm:items-center text-gray-500">
                <BsCalendar2DateFill className="text-gray-500 shrink-0 mt-1 sm:mt-0 mr-2" />
                <span>
                  <EventDate event={event} locale={i18n.language as currentSupportLocale} />
                </span>
              </p>

              {!!event.type && !!event.location.type && (
                <p aria-label={t("event.aria.venueType")} className="flex items-center text-gray-500">
                  <FaHotel className="text-gray-500 shrink-0 mr-2" />
                  <span>
                    {[
                      event.location.type && t(`event.locationType.${event.location.type}`),
                      event.type && t(`event.type.${event.type}`),
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  </span>
                </p>
              )}

              <p aria-label={t("event.aria.scale")} className="flex items-center text-gray-500">
                <FaPeoplePulling className="text-gray-500 shrink-0 mr-2" />
                <span>{t("event.scaleDes", { scale: t(`event.scale.${event.scale}`) })}</span>
              </p>

              {priceSummary && (
                <p aria-label={t("event.aria.price")} className="flex items-center text-gray-500">
                  <IoTicket className="text-gray-500 shrink-0 mr-2" />
                  <a href="#event-offers" className="tabular-nums hover:text-gray-700 transition-colors">
                    {priceSummary.formatted
                      ? priceSummary.formatted.isFree
                        ? priceSummary.hasRange
                          ? t("event.offers.startingFrom", { price: t("event.offers.free") })
                          : t("event.offers.free")
                        : priceSummary.hasRange
                          ? t("event.offers.startingFrom", { price: priceSummary.formatted.text })
                          : priceSummary.formatted.text
                      : t("event.offers.priceTbd")}
                    {" · "}
                    {t("event.offers.tierCount", { count: priceSummary.count })}
                  </a>
                </p>
              )}
            </div>
          </div>

          <EventSourceButton sources={event.sources || []} eventName={event.name} />
        </div>
      </div>

      <EventOffersCard key={`offers:${event.id}`} offers={event.offers} />

      {/* Mobile: 展商信息与展会地图合并卡片（文件夹/Chrome 风格顶部 Tab） */}
      {(hasOrganization || hasValidCoordinates) && (
        <div className="md:hidden my-3">
          {showMobileTabs ? (
            <div className="drop-shadow-sm">
              <div className="grid grid-cols-2 select-none" role="tablist">
                {(
                  [
                    { key: "organization", label: t("event.organization") },
                    { key: "map", label: t("event.map") },
                  ] as const
                ).map(({ key, label }, index) => {
                  const isActive = mobileTab === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setMobileTab(key)}
                      className={clsx(
                        "relative flex items-center justify-center py-2.5 px-3 text-sm rounded-t-xl transition-colors",
                        isActive
                          ? "bg-white text-gray-800 font-bold z-10 -mb-px pb-[calc(0.625rem+1px)]"
                          : "text-gray-500 font-medium active:text-gray-700",
                      )}
                    >
                      {isActive && index === 0 && (
                        <span
                          aria-hidden
                          className="pointer-events-none absolute -right-3 bottom-0 w-3 h-3"
                          style={{
                            background: "radial-gradient(circle at 100% 0, transparent 11.5px, #ffffff 12px)",
                          }}
                        />
                      )}
                      {isActive && index === 1 && (
                        <span
                          aria-hidden
                          className="pointer-events-none absolute -left-3 bottom-0 w-3 h-3"
                          style={{
                            background: "radial-gradient(circle at 0 0, transparent 11.5px, #ffffff 12px)",
                          }}
                        />
                      )}
                      <span className="truncate">{label}</span>
                    </button>
                  );
                })}
              </div>

              <div
                className={clsx(
                  "bg-white rounded-b-xl",
                  mobileTab === "organization" ? "rounded-tr-xl" : "rounded-tl-xl",
                )}
              >
                {mobileTab === "organization" ? (
                  <EventOrganizationCard
                    key={event.id}
                    event={event}
                    showDescriptionContainer={showDescriptionContainer}
                    embedded
                  />
                ) : (
                  <EventMapCard
                    key={`mobile:${mapKey}`}
                    latitude={event.location.place?.latitude}
                    longitude={event.location.place?.longitude}
                    embedded
                  />
                )}
              </div>
            </div>
          ) : hasOrganization ? (
            <EventOrganizationCard key={event.id} event={event} showDescriptionContainer={showDescriptionContainer} />
          ) : (
            <EventMapCard
              key={`mobile:${mapKey}`}
              latitude={event.location.place?.latitude}
              longitude={event.location.place?.longitude}
            />
          )}
        </div>
      )}

      {/* Desktop: 保持原有独立地图卡片 */}
      <div className="hidden md:block">
        <EventMapCard
          key={mapKey}
          latitude={event.location.place?.latitude}
          longitude={event.location.place?.longitude}
        />
      </div>

      {(showDescriptionContainer || hasOrganization) && (
        <div
          className={clsx(
            "flex my-3 sm:my-4 md:items-start flex-col md:flex-row gap-3 sm:gap-4",
            !showDescriptionContainer && "hidden md:flex",
          )}
        >
          {showDescriptionContainer && (
            <div id="event-detail__left" className="md:w-8/12 min-w-0 space-y-3 sm:space-y-4">
              {event.detail && (
                <div className="bg-white shadow-sm rounded-xl flex-grow p-4 sm:p-6">
                  <div
                    className="text-gray-600 text-sm sm:text-base leading-relaxed whitespace-pre-line break-words"
                    dangerouslySetInnerHTML={{ __html: event.detail }}
                  />
                </div>
              )}

              {!!event.media?.images?.length && (
                <div className="bg-white shadow-sm rounded-xl flex-grow p-2.5 sm:p-6 space-y-2">
                  <EventImageAnchors
                    key={`bar:${event.id}`}
                    anchors={imageAnchors}
                    variant="bar"
                    className="md:hidden"
                  />

                  {event.media?.images?.map((cover, index) => {
                    const imageTitle = cover.title?.trim();
                    return (
                      <div
                        className="relative scroll-mt-28 md:scroll-mt-4"
                        id={imageTitle ? getEventImageAnchorId(index) : undefined}
                        key={cover.url}
                      >
                        <NextImage
                          alt={
                            imageTitle
                              ? `${event.name} - ${imageTitle}`
                              : t("event.detailImageAlt", {
                                  name: event.name,
                                  index: index + 1,
                                })
                          }
                          src={cover.url}
                          className="w-full"
                          autoFormat
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {hasDesktopSidebar && (
            <div
              className={clsx(
                "hidden md:flex md:flex-col gap-4 md:self-stretch",
                showDescriptionContainer ? "md:w-4/12 shrink-0" : "w-full",
              )}
            >
              <EventOrganizationCard key={event.id} event={event} showDescriptionContainer={showDescriptionContainer} />
              <EventImageAnchors
                key={`sidebar:${event.id}`}
                anchors={imageAnchors}
                variant="sidebar"
                className="sticky top-4"
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  context.res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=300");

  try {
    const { locale: localeParam } = context;
    const appLocale = formatLocale(localeParam);

    const urlKey = z
      .string()
      .regex(/^[a-z0-9]{7}$/)
      .safeParse(context.params?.urlKey);

    if (!urlKey.success) {
      return { notFound: true };
    }

    const pageviewPath = getEventDetailUrl({
      urlKey: urlKey.data,
      locale: appLocale,
    });

    const [event, layoutProps] = await Promise.all([
      EventsAPI.getEventDetail(urlKey.data),
      getLayoutProps(localeParam),
    ]);
    // 访问量按实体读取历史本底，需要先取得活动 ID。
    const pv = await InfraAPI.getPageview({
      targetType: "event",
      targetId: event.id,
      path: pageviewPath,
    }).catch((): null => null);

    const { primary: primaryOrganization } = getEventOrganizations(event);

    return {
      props: {
        event: event,
        pageviewCount: pv,
        headMetas: {
          title: `${event.name}-${primaryOrganization?.name ?? ""}`,
          keywords: keywordGenerator({
            page: "event",
            locale: appLocale,
            event: {
              name: event?.name,
              startDate: event?.startAt,
              city: event.location.region?.localName || undefined,
            },
          }),
          des: eventDescriptionGenerator(appLocale, { ...event, organization: primaryOrganization }),
          url: getEventDetailUrl({
            urlKey: event.urlKey,
            locale: appLocale,
          }),
          cover: imageUrl(getEventCoverImgPath(event)),
        },
        structuredData: generateEventDetailStructuredData({
          event,
          locale: appLocale,
        }),
        ...layoutProps,
      },
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return {
          notFound: true,
        };
      }
    }
    throw error;
  }
}
